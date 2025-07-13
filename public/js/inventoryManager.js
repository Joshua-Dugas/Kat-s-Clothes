function setupInventoryManager(itemType, formId, apiPath) {
    async function fetchItems() {
        try {
            const response = await fetch(`/api/${apiPath}`);
            if (!response.ok) throw new Error("Network response was not ok");
            const data = await response.json();

            const tableBody = document.getElementById("tableBody");
            const headerRow = document.getElementById("tableHeaders");
            tableBody.innerHTML = "";
            headerRow.innerHTML = "";

            if (!Array.isArray(data) || data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="100%">No data available</td></tr>';
                return;
            }

            const headers = Object.keys(data[0]);
            headers.forEach(header => {
                const th = document.createElement("th");
                th.textContent = header;
                headerRow.appendChild(th);
            });
            const deleteTh = document.createElement("th");
            deleteTh.textContent = "Delete";
            headerRow.appendChild(deleteTh);
            const updateSoldTh = document.createElement("th");
            updateSoldTh.textContent = "Update Sold Status";
            headerRow.appendChild(updateSoldTh);
            const updateTagTh = document.createElement("th");
            updateTagTh.textContent = "Update New Tag Status";
            headerRow.appendChild(updateTagTh);

            data.forEach(row => {
                const tr = document.createElement("tr");
                headers.forEach(header => {
                    const td = document.createElement("td");
                    let value = row[header];
                    if (header === "date_listed" && value) {
                        // Format to YYYY-MM-DD
                        value = value.slice(0, 10);
                    }
                    td.textContent = value ?? "N/A";
                    tr.appendChild(td);
                });

                // Delete button
                const deleteTd = document.createElement("td");
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.onclick = () => deleteItem(row.id);
                deleteTd.appendChild(deleteButton);
                tr.appendChild(deleteTd);

                // Update sold status
                const updateTd = document.createElement("td");
                const select = document.createElement("select");
                select.id = `is_sold_${row.id}`;
                const optionNotSold = document.createElement("option");
                optionNotSold.value = "false";
                optionNotSold.textContent = "Not Sold";
                if (!row.is_sold) optionNotSold.selected = true;
                const optionSold = document.createElement("option");
                optionSold.value = "true";
                optionSold.textContent = "Sold";
                if (row.is_sold) optionSold.selected = true;
                select.appendChild(optionNotSold);
                select.appendChild(optionSold);

                const updateButton = document.createElement("button");
                updateButton.textContent = "Update";
                updateButton.onclick = () => updateSoldStatus(row.id);
                updateTd.appendChild(select);
                updateTd.appendChild(updateButton);
                tr.appendChild(updateTd);

                tableBody.appendChild(tr);

                // Update new tag status
                const updateTagTd = document.createElement("td");
                const selectTag = document.createElement("select");
                selectTag.id = `new_tag_${row.id}`;
                const optionNotTagged = document.createElement("option");
                optionNotTagged.value = "false";
                optionNotTagged.textContent = "Not Tagged";
                if (!row.new_tag) optionNotTagged.selected = true;
                const optionTagged = document.createElement("option");
                optionTagged.value = "true";
                optionTagged.textContent = "Tagged";
                if (row.new_tag) optionTagged.selected = true;
                selectTag.appendChild(optionNotTagged);
                selectTag.appendChild(optionTagged);

                const updateTagButton = document.createElement("button");
                updateTagButton.textContent = "Update";
                updateTagButton.onclick = () => updateTagStatus(row.id);
                updateTagTd.appendChild(selectTag);
                updateTagTd.appendChild(updateTagButton);
                tr.appendChild(updateTagTd);

                tableBody.appendChild(tr);
            });
        } catch (error) {
            console.error(`Error fetching ${itemType}:`, error);
            document.getElementById("tableBody").innerHTML =
                `<tr><td colspan="100%">Error loading data</td></tr>`;
        }
    }

    async function updateTagStatus(id) {
    const selectTag = document.getElementById(`new_tag_${id}`);
    const new_tag = selectTag.value === "true";
    try {
        const response = await fetch(`/api/${apiPath}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ new_tag }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Failed to update ${itemType} tag status`);
        }
        alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} tag status updated successfully`);
        fetchItems();
    } catch (error) {
        console.error(`Error updating ${itemType} tag status:`, error);
        alert(`Error updating ${itemType} tag status: ${error.message}`);
    }
}

    async function updateSoldStatus(id) {
        const select = document.getElementById(`is_sold_${id}`);
        const is_sold = select.value === "true";
        try {
            const response = await fetch(`/api/${apiPath}/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ is_sold }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to update ${itemType} status`);
            }
            alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} status updated successfully`);
            fetchItems();
        } catch (error) {
            console.error(`Error updating ${itemType} status:`, error);
            alert(`Error updating ${itemType} status: ${error.message}`);
        }
    }

    async function deleteItem(id) {
        if (!confirm(`Are you sure you want to delete this ${itemType}?`)) return;
        try {
            const response = await fetch(`/api/${apiPath}/${id}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to delete ${itemType}`);
            }
            alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} deleted successfully`);
            fetchItems();
        } catch (error) {
            console.error(`Error deleting ${itemType}:`, error);
            alert(`Error deleting ${itemType}: ${error.message}`);
        }
    }
    //item submission
    document.getElementById(formId).addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const itemData = {};
        for (const [key, value] of formData.entries()) {
            if (key === "is_sold") {
                itemData.is_sold = value === "on";
            } else if (key === "list_price" || key === "item_cost") {
                itemData[key] = parseFloat(value);
            } else {
                itemData[key] = value;
            }
        }

        try {
            const response = await fetch(`/api/${apiPath}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(itemData),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Failed to add ${itemType}`);
            }
            alert(`${itemType.charAt(0).toUpperCase() + itemType.slice(1)} added successfully`);
            e.target.reset();
            fetchItems();
        } catch (error) {
            console.error(`Error adding ${itemType}:`, error);
            alert(`Error adding ${itemType}: ${error.message}`);
        }
    });

    window.onload = fetchItems;
}