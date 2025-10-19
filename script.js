
document.addEventListener("DOMContentLoaded", () => {
    
    class Todo
    {
        constructor() {
            this.cnt = 0;
            this.Tasks = [];
            this.fltrd_Tasks = [];
            this.load();        
        }

        filter_tasks() {
            const query = document.getElementById("search_bar").value.trim().toLowerCase();
        
            if (query === "") {
                this.fltrd_Tasks = Array.from(this.Tasks);
            } else {
                this.fltrd_Tasks = this.Tasks.filter(task => 
                    task.title.toLowerCase().includes(query) ||
                    (task.date && task.date.toLowerCase().includes(query))
                );
            }
        
            this.draw();
        }

        draw() {
            const listContainer = document.getElementById("todo_list");
            listContainer.innerHTML = "";

            const query = document.getElementById("search_bar").value.trim().toLowerCase();
        
            if (query.length < 2)
                this.Display = Array.from(this.Tasks);
            else
                this.Display = Array.from(this.fltrd_Tasks);

            this.Display.forEach((task, index) => {
                const itemDiv = document.createElement("div");
                itemDiv.className = "todo_item";
                itemDiv.id = task.id;

                const titleEl = document.createElement("h2");
                titleEl.className = "in_list_item";
                titleEl.textContent = task.title;

                //edit title
                titleEl.addEventListener("click", () => {
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = task.title;
                    input.className = "in_list_item";
                    // Replace title element with input
                    itemDiv.replaceChild(input, titleEl);
                    input.focus();
        
                    const saveTitle = () => {
                        task.title = input.value.trim() || task.title;
                        this.save();
                        this.draw();
                    };
                    input.addEventListener("blur", saveTitle);
                    input.addEventListener("keydown", (e) => {
                        if (e.key === "Enter") saveTitle();
                    });
                });

                const dateEl = document.createElement("h2");
                dateEl.className = "in_list_item";
                dateEl.textContent = task.date ? task.date : "";

                //edit date
                dateEl.addEventListener("click", () => {
                    const input = document.createElement("input");
                    input.type = "date";
                    input.value = task.date || "";
                    input.className = "in_list_item";
                    itemDiv.replaceChild(input, dateEl);
                    input.focus();
        
                    const saveDate = () => {
                        task.date = input.value.trim();
                        this.save();
                        this.draw();
                    };

                    input.addEventListener("blur", saveDate);
                });

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.className = "in_list_item";
                checkbox.checked = task.completed || false;

                //checkbox update
                checkbox.addEventListener("change", () => {
                    const t = this.Tasks.find(t => t.id === task.id);
                    if (t) {
                        t.completed = checkbox.checked;
                        this.save();                   
                    }
                });

                const deleteImg = document.createElement("img");
                deleteImg.src = "rubbish.png";
                deleteImg.alt = "rubbish";
                deleteImg.className = "in_list_item";
                
                //delete func
                deleteImg.onclick = () => {
                    this.Tasks.splice(index, 1);
                    this.draw();
                    this.save();
                };

                //build html
                itemDiv.appendChild(titleEl);
                itemDiv.appendChild(dateEl);
                itemDiv.appendChild(checkbox);
                itemDiv.appendChild(deleteImg);
                listContainer.appendChild(itemDiv);
            });
        }

        //add with html vals
        addTask() {
            const titleInput = document.getElementById("new_name");
            const dateInput = document.getElementById("new_date");
        
            const title = titleInput.value.trim();
            const date = dateInput.value.trim();
        
            if (!title) return;

            const task = {
                id: this.cnt++,
                title,
                date,
                completed: false
            };
            
            if (title.length >= 3 &&
                title.length <= 255 &&
                (date == "" || new Date(date) > (new Date()))
                )
            {
                this.Tasks.push(task);
                this.save();
                this.draw();
            }

        
            titleInput.value = "";
            dateInput.value = "";
        }

        //add with vals
        // addTask(title, date = "") {
        //     const task = { 
        //         id:this.cnt++, 
        //         title, 
        //         date, 
        //         completed: false 
        //     };

        //     this.Tasks.push(task);
        //     this.save();
        //     this.draw();
        // }

        save() 
        {
            localStorage.setItem("tasks", JSON.stringify(this.Tasks));
        }

        load() 
        {
            const data = localStorage.getItem("tasks");
            if (data) {
                try {
                    this.Tasks = JSON.parse(data);
                } catch (e) {
                    console.error("Error reading from local storage:", e);
                    this.Tasks = [];
                }
            }

            this.draw();
        }
    }

    const todo = new Todo();

    document.getElementById("search_bar").addEventListener("input", function () {
        const query = this.value.trim().toLowerCase();
        
        todo.filter_tasks();

        if (query === "") return;

        const list = document.getElementById("todo_list");
    
        //removes old highlights
        const oldHighlights = list.querySelectorAll("mark");
        oldHighlights.forEach(el => {
            const parent = el.parentNode;
            parent.replaceChild(document.createTextNode(el.textContent), el);
            parent.normalize();
        });    
    
        const walker = document.createTreeWalker(list, NodeFilter.SHOW_TEXT, null, false);
        const regex = new RegExp(`(${query})`, "gi");
        const textNodes = [];

        //finds searched patterns
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.nodeValue.toLowerCase().includes(query)) {
                textNodes.push(node);
            }
        }
        
        //adds highlights
        textNodes.forEach(node => {
            const span = document.createElement("span");
            span.innerHTML = node.nodeValue.replace(regex, "<mark>$1</mark>");
            node.parentNode.replaceChild(span, node);
        });
    });

    document.getElementById("new_button").addEventListener("click", () => {
        todo.addTask();
    });
});
