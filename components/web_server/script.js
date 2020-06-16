function select_file() {
    
    var new_file_path = document.getElementById("btn_select").files[0].name;
    var panel_file_select = document.getElementById("panel_file_select");
    var btn_upload = document.getElementById("btn_upload");
    var btn_select = document.getElementById("btn_select");

    // Se the message as vissible with the game name
    panel_file_select.style.visibility = "visible";
    panel_file_select.innerHTML = "Selected:" + new_file_path;

    // This create a animation on the game message name by changing the opacity of the box
    var opacity = 0;
    var id = setInterval(frame, 1);

    function frame() {
        if (opacity == 80) {
            btn_upload.style.visibility = "visible";
            document.getElementById("btn_select").style.disabled = "true";
            panel_file_select.style.opacity = 0.8;
            clearInterval(id);
        } else {
            opacity++;
            panel_file_select.style.opacity = opacity / 100;
        }
    }

}select_file();

function upload_game() {
    var btn_upload = document.getElementById("btn_upload");
    var panel_file_select = document.getElementById("panel_file_select");
    var bar_upload = document.getElementById("bar_upload");

    var game_name = document.getElementById("btn_select").files[0].name;
    var game_size = document.getElementById("btn_select").files[0].size;
    var game_console = 0;

    var upload_path = "/upload/" + game_name;
    var game_file = document.getElementById("btn_select").files[0];
    var max_file_size = 2 * 1024 * 1024; //Maximum size of 2MB. The server should has the same value

    if (document.getElementById("btn_select").files[0].name.search(".gbc") > -1) {
        game_console = "Game Boy Color"
    } else if (document.getElementById("btn_select").files[0].name.search(".gb") > -1) {
        game_console = "Game Boy"
    } else {
        panel_file_select.style.visibility = "hidden";
        btn_upload.style.visibility = "hidden";
        alert("File not allowed");
        return;
    }

    panel_file_select.style.visibility = "hidden";
    btn_upload.style.visibility = "hidden";
    bar_upload.style.visibility = "visible"

    var width = 0;
    var upload_animation = setInterval(upload_frame, 10);

    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", upload_path, true);
    xhttp.send(game_file);

    xhttp.onreadystatechange = function () {

        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                clearInterval(upload_animation);
                bar_upload.style.visibility = "hidden"
                add_new_game_row(game_name, game_size, game_console);
                get_memory_ussage();

            } else if (xhttp.status == 0) {
                alert("Server closed the connection abruptly!");
                location.reload();
                delete_game(row);
            } else {
                alert(xhttp.status + " Error!\n" + xhttp.responseText);
                location.reload();
                delete_game(row);
            }
        }

    };

    function upload_frame() {
        if (width == 100) {
            width = 0;
        } else {
            bar_upload.style.width = width + '%';
            bar_upload.innerHTML = "Uploading...";
            width++;
        }
    }

}

function delete_game(row) {

    var d = row.parentNode.parentNode.rowIndex;
    var game_name_del = document.getElementById('table').rows[d].cells[0].innerHTML;

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (xhttp.readyState == 4) {
            if (xhttp.status == 200) {
                //add_new_game_row(game_name,game_size,game_console);
                var d = row.parentNode.parentNode.rowIndex;
                document.getElementById('table').deleteRow(d);
                get_memory_ussage();

            } else if (xhttp.status == 0) {
                alert("Server closed the connection abruptly!");
                location.reload();
                delete_game(row);
            } else {
                alert(xhttp.status + " Error!\n" + xhttp.responseText);
                location.reload();
                delete_game(row);
            }
        }

    };

    xhttp.open("POST", "delete/" + game_name_del, true);
    xhttp.send(null);

}

function get_memory_ussage() {
    var elem = document.getElementById("memoryUssageBar");

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", "/mem_ussage", false);
    xmlHttp.send(null);

    var mem_ussage_percentage = xmlHttp.responseText;

    var width = 0;
    var id = setInterval(frame, 1);

    function frame() {
        if (width == mem_ussage_percentage || mem_ussage_percentage == 0) {
            clearInterval(id);
        } else {
            width++;
            elem.style.width = width + '%';
            elem.innerHTML = width * 1 + '%';
        }
    }
    console.log(mem_ussage_percentage);
}

function add_new_game_row(game_name, game_size, game_console) {
    var table_element = document.getElementById("table");

    var row = table_element.insertRow(1);
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);
    var cell3 = row.insertCell(2);
    var cell4 = row.insertCell(3);
    cell1.innerHTML = game_name;
    cell2.innerHTML = game_size;
    cell3.innerHTML = game_console;
    cell4.innerHTML =
        "<del_btn class=\"w3-button w3-circle w3-red\" onclick=\"delete_game(this)\"> X</del_btn>";
}

function update_gamelist() {

    var xmlHttp = new XMLHttpRequest();

    xmlHttp.open("GET", "/gamelist", false);
    xmlHttp.send(null);

    var game_list = xmlHttp.responseText.split('/');

    var add_row_loop = setInterval(game_add, 1);
    var game_index = 0;
    console.log(game_list.length);

    function game_add() {
        if (game_index >= game_list.length - 1) {
            clearInterval(add_row_loop);
        } else {
            add_new_game_row(game_list[game_index], game_list[game_index + 1], "Game Boy Color");
            game_index = game_index + 2;
        }
    }

}

console.log("goo");
document.getElementById("memoryUssageBar").innerHTML = get_memory_ussage();
update_gamelist();

