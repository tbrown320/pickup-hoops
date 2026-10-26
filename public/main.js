let plus = document.getElementsByClassName("fa-plus");
let minus = document.getElementsByClassName("fa-minus");
let trash = document.getElementsByClassName("fa-trash");

Array.from(plus).forEach(function (element) {
    element.addEventListener('click', function () {
        const id = this.parentNode.parentNode.dataset.id
        const player = document.getElementById('playerName').value
        const position = document.getElementById('playerPosition').value
        if (!player) return alert('Type your name in the box at the top first!')
        fetch('games', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'id': id,
                'player': player,
                'position': position
            })
        })
            .then(response => {
                if (response.ok) return response.json()
            })
            .then(data => {
                console.log(data)
                if (data && data.full) {
                    alert('All spots in this session are filled!')
                } else {
                    window.location.reload(true)
                }
            })
    });
});


Array.from(minus).forEach(function (element) {
    element.addEventListener('click', function () {
        const id = this.parentNode.parentNode.dataset.id
        const player = document.getElementById('playerName').value
        fetch('games/leave', {
            method: 'put',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                'id': id,
                'player': player
            })
        })
            .then(response => {
                if (response.ok) return response.json()
            })
            .then(data => {
                console.log(data)
                window.location.reload(true)
            })
    });
});

Array.from(trash).forEach(function (element) {
    element.addEventListener('click', function () {
        const id = this.parentNode.parentNode.dataset.id
        fetch('games', {
            method: 'delete',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                'id': id
            })
        }).then(function (response) {
            window.location.reload()
        })
    });
});
