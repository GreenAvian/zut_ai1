document.addEventListener("DOMContentLoaded", () => {

    function shuffle_load()
    {
        const wrapper = document.getElementById('s_puzzle_wrapper');
        const slots = Array.from(wrapper.getElementsByClassName('puzzle_slot'));
        
        for (let i = slots.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            wrapper.appendChild(slots[j]);
        }
    }

    function verifyPuzzle() {
        const destinationSlots = document.querySelectorAll('#d_puzzle_wrapper > .puzzle_slot');
        let allCorrect = true;
        let correctCount = 0;
        
        destinationSlots.forEach(destinationSlot => {
            const destNumber = destinationSlot.id.split('_')[2]; //ID
            if (destinationSlot.children.length > 0) {
                const puzzlePiece = destinationSlot.children[0];
                const pieceNumber = puzzlePiece.id.split('_')[2]; //ID
            
                if (pieceNumber === destNumber) {
                    correctCount++;
                }
            }
        });
        
        const totalSlots = destinationSlots.length;
        if (correctCount === totalSlots) {
            if (Notification.permission === "granted") 
            {
                new Notification("Puzzle completed");
            } else if (Notification.permission !== "denied") 
            {
                Notification.requestPermission().then(permission => {
                    if (permission === "granted") {
                        new Notification("Puzzle completed");
                    }
                });
            }
            alert('Puzzle completed');
            return true;
        } else {
            console.log(`Progress: ${correctCount}/${totalSlots}`);
            return false;
        }
    }

    function generatePuzzleSlots() {
        //filling the puzzle spaces
        let wrapper = document.getElementById('s_puzzle_wrapper');
        wrapper.innerHTML = '';
        for (let i = 1; i <= 16; i++) {
            const canvas = document.createElement('canvas');
            canvas.className = 'puzzle_slot';
            canvas.draggable = true;
            canvas.id = `s_puzzle_${i}`;
            
            wrapper.appendChild(canvas);
        }

        wrapper = document.getElementById('d_puzzle_wrapper');
        wrapper.innerHTML = '';
        for (let i = 1; i <= 16; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle_slot';
            slot.id = `d_puzzle_${i}`;
            
            wrapper.appendChild(slot);
        }

        shuffle_load();
        
        //Drag n drop listeners
        let items = document.querySelectorAll('#s_puzzle_wrapper > .puzzle_slot');
        for (let item of items) {
            item.addEventListener("dragstart", function(event) {
                event.dataTransfer.setData("text", this.id);
            });
        }

        let targets = document.querySelectorAll('#d_puzzle_wrapper > .puzzle_slot');
        for (let target of targets) {
            target.addEventListener("dragenter", function (event) {
                this.style.borderTop = "2px dashed black";
                this.style.borderLeft = "2px dashed black";
                
            });
            target.addEventListener("dragleave", function (event) {
                this.style.borderTop = "2px solid black";
                this.style.borderLeft = "2px solid black";
            });
            target.addEventListener("dragover", function (event) {
                event.preventDefault();
            });
            target.addEventListener("drop", function (event) {
                let myElement = document.querySelector("#" + event.dataTransfer.getData('text'));
                this.appendChild(myElement)
                this.style.borderTop = "0px solid black";
                this.style.borderLeft = "0px solid black";
                verifyPuzzle();
            }, false);
        }
    }
  
    generatePuzzleSlots();
  
    let map = L.map('map_active').setView([53.444608,  14.516224], 18);
    // L.tileLayer.provider('OpenStreetMap.DE').addTo(map);
    L.tileLayer.provider('Esri.WorldImagery').addTo(map);
    let marker = L.marker([53.444608,  14.516224]).addTo(map);

    function save_pieces()
    {
        generatePuzzleSlots();
        leafletImage(map, function (err, canvas) {
            const sourceWidth = canvas.width;
            const sourceHeight = canvas.height;
            const pieceWidth = sourceWidth / 4;
            const pieceHeight = sourceHeight / 4;

            for (let row = 0; row < 4; row++) {
                for (let col = 0; col < 4; col++) {
                    const pieceIndex = row * 4 + col;
                    const puzzleSlot = document.getElementById(`s_puzzle_${pieceIndex + 1}`);
                    
                    if (puzzleSlot) {
                        const ctx = puzzleSlot.getContext('2d');
                   
                        puzzleSlot.width = pieceWidth;
                        puzzleSlot.height = pieceHeight;
                        
                        ctx.drawImage(
                            canvas,
                            col * pieceWidth,    // source x
                            row * pieceHeight,   // source y
                            pieceWidth,          // source width
                            pieceHeight,         // source height
                            0,                   // destination x
                            0,                   // destination y
                            pieceWidth,          // destination width
                            pieceHeight          // destination height
                        );
                    }
                }
            }
        });
    }

    function save_raster()
    {
        leafletImage(map, function (err, canvas) {
            let rasterMap = document.getElementById("map_img");
            let rasterContext = rasterMap.getContext("2d");

            rasterContext.drawImage(canvas, 0, 0, 660, 660);
        });
        save_pieces();
    }

    

    document.getElementById("save_map_img").addEventListener("click", save_raster);

    document.getElementById("get_location").addEventListener("click", function(event) {
        if (! navigator.geolocation) {
            console.log("No geolocation.");
        }

        navigator.geolocation.getCurrentPosition(position => {
            console.log(position);
            let lat = position.coords.latitude;
            let lon = position.coords.longitude;

            map.setView([lat, lon]);
            map.removeLayer(marker);
            marker = L.marker([lat, lon]).addTo(map);
        }, positionError => {
            console.error(positionError);
        });
    });     
});