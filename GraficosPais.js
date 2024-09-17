// Javier Ramos Jimeno

// Se recupera el parámetro del nombre del país desde la URL
var urlParams = new URLSearchParams(window.location.search);
var nombrePais = urlParams.get('pais');
// Ponemos el nombre del país seleccionado de titulo
var titulo = document.getElementById('TituloPais');
titulo.textContent = `${nombrePais}`;

// Creamos un boton que permita volver al mapa
var BotonVolver = document.getElementById('BotonVolver');
BotonVolver.addEventListener('click', function() {
    window.location.href = 'index.html';
});





/*********************************************** Grafico Lineas Pais **************************************************/
var TemperaturaPais = [];
d3.csv("./Datos/GlobalLandTemperaturesByCountryAnual.csv").then(function(datos){
    datos.forEach(function(d){
        if(d.Pais == nombrePais){
            TemperaturaPais.push(d);
        }
    });
    drawGraficoLineas(TemperaturaPais);
});

/**
 * drawGraficoLineas: Dibuja un grafico de lineas animado en el elemento GraficoLineas
 * @param {*} datos Datos que queremos utilizar en el grafico de lineas
 */
function drawGraficoLineas(datos) {
    var GraficoLineas = document.getElementById("GraficoLineas");
    var margin = { top: 20, right: 20, bottom: 50, left: 50 };
    var width = GraficoLineas.clientWidth - margin.left - margin.right;
    var height = GraficoLineas.clientHeight - margin.top - margin.bottom;

    // Se elimina en caso de ya existir un grafico
    d3.selectAll("#GraficoLineasSvg").remove();

    // Creamos el svg para hacer el grafico
    var svg = d3.select("#GraficoLineas")
        .append("svg")
        .attr("id", "GraficoLineasSvg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + width/5 +"," + margin.top + ")");

    // Escalas
    // Escala X
    var xScale = d3.scaleLinear()
        .domain(d3.extent(datos, function(d) { return d.Year; }))
        .range([0, width/1.5]);
    // Escala Y
    var yScale = d3.scaleLinear()
        .domain([d3.min(datos, function(d) { return parseFloat(d.Media);}) - 0.05, d3.max(datos, function(d) { return parseFloat(d.Media); }) + 0.05])
        .range([height, 0]);

    // Línea
    var line = d3.line()
        .x(function(d) { return xScale(d.Year); })
        .y(function(d) { return yScale(d.Media); });
    // Ponemos la linea en el grafico
    var path = svg.append("path")
        .data([datos])
        .attr("class", "line")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "black");
    // Hacemos una animación para la línea
    var totalLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(10000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Ejes
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width * 2/6) + "," + (height + margin.bottom) + ")")
        .text("Años");
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90) translate(" + -height / 2 + "," + -margin.left + ")")
        .text("Temperatura Media Anual (ºC)");

    // Ponemos un título
    svg.append("text")
        .attr("x", width * 2/6)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .style("font-weight", "bold")
        .text("Evolución de la temperatura");
}





/********************************************** Grafico Lineas Ciudad *************************************************/
var TemperaturasCiudadesPais = [];
var NombresCiudades = []; var Nciudades = 0;
var listaCiudades = document.getElementById("ListaCiudades");
var listaCiudades2 = document.getElementById("ListaCiudades2");

// Leemos el fichero con los datos
d3.csv("./Datos/GlobalLandTemperaturesByCityAnual.csv").then(function(datos){
    datos.forEach(function(d){
        if(d.Pais == nombrePais){
            TemperaturasCiudadesPais.push(d);
        }
    });
    // Contamos el numero de ciudades que tenemos en este pais y sus nombres
    TemperaturasCiudadesPais.forEach(function(d){
        if(d.Year == 1950){
            NombresCiudades.push(d);
            Nciudades ++;
        }
    })

    // Necesitamos tener en cuenta el numero de ciudades
    if(Nciudades == 0){
        // Si no tenemos ciudades no se puede mostrar mas informacion asi que recolocamos los elementos
        d3.select("#SeleccionCiudades").remove();
        var divGraficoLineas = document.getElementById("GraficoLineas");
        divGraficoLineas.style.height = "80%";
        // Dibujamos de nuevo para que tenga efecto el cambio de tamano realizado
        drawGraficoLineas(TemperaturaPais);        
    } else if(Nciudades == 1){
        // Ponemos las diferentes opciones con las ciudades del pais
        NombresCiudades.forEach(function(ciudad) {
            var option = document.createElement("option");
            option.value = ciudad.Ciudad; 
            option.text = ciudad.Ciudad;
            listaCiudades.appendChild(option);
        });    

        // Eliminamos todo lo correspondiente a la seleccion de una segunda ciudad        
        d3.select("#RectRojo").remove();
        d3.select("#ListaCiudades2").remove();
        d3.select("#Selector2").remove();
        // Dibujamos el grafico de lineas de la ciudad seleccionada
        drawLinesCity(listaCiudades.value, TemperaturasCiudadesPais);
    } else {
        // Ponemos las diferentes opciones con las ciudades del pais
        NombresCiudades.forEach(function(ciudad) {
            var option = document.createElement("option");
            option.value = ciudad.Ciudad; 
            option.text = ciudad.Ciudad;
            listaCiudades.appendChild(option);
        });    
        NombresCiudades.forEach(function(ciudad) {
            if(ciudad.Ciudad != listaCiudades.value){
                var option = document.createElement("option");
                option.value = ciudad.Ciudad; 
                option.text = ciudad.Ciudad;
                listaCiudades2.appendChild(option);
            }
        });  

        // Dibujamos el grafico de lineas de las ciudades seleccionadas
        drawLinesCities(listaCiudades.value, listaCiudades2.value, TemperaturasCiudadesPais);
    }
});

/**
 * drawLinesCity: Funcion que permite representar un grafico de lineas de la ciudad indicada
 * @param {*} ciudad que queremos representar
 * @param {*} datos de los que se van a extraer los valores para la ciudad indicada
 */
function drawLinesCity(ciudad, datos){
    // Nos quedamos unicamente con los datos de la ciudad correspondiente
    var TemperaturasCiudad = [];
    datos.forEach(function(d){
        if(d.Ciudad == ciudad){
            TemperaturasCiudad.push(d);
        }
    });

    var GraficoLineas = document.getElementById("GraficoLineasCiudades");
    var margin = { top: 20, right: 20, bottom: 50, left: 50 };
    var width = GraficoLineas.clientWidth - margin.left - margin.right;
    var height = GraficoLineas.clientHeight - margin.top - margin.bottom;

    // Se elimina en caso de ya existir un grafico
    d3.selectAll("#GraficoLineasCiudadesSvg").remove();

    var svg = d3.select("#GraficoLineasCiudades")
        .append("svg")
        .attr("id", "GraficoLineasCiudadesSvg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + width/5 +"," + + margin.top + ")");

    // Escalas
    // Escala X
    var xScale = d3.scaleLinear()
        .domain(d3.extent(TemperaturasCiudad, function(d) { return d.Year; }))
        .range([0, width/1.5]);
    // Escala Y
    var yScale = d3.scaleLinear()
        .domain([d3.min(TemperaturasCiudad, function(d) { return parseFloat(d.Media);}) - 0.05, d3.max(TemperaturasCiudad, function(d) { return parseFloat(d.Media); }) + 0.05])
        .range([height, 0]);

    // Línea
    var line = d3.line()
        .x(function(d) { return xScale(d.Year); })
        .y(function(d) { return yScale(d.Media); });
    // Ponemos la linea en el grafico
    var path = svg.append("path")
        .data([TemperaturasCiudad])
        .attr("class", "line")
        .attr("d", line)
        .style("fill", "none")
        .style("stroke", "blue")
    // Hacemos una animación para la línea
    var totalLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(10000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Ejes
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width * 2/6) + "," + (height + margin.bottom) + ")")
        .text("Años");
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90) translate(" + -height / 2 + "," + -margin.left + ")")
        .text("Temperatura Media Anual (ºC)");

    // Ponemos un título
    svg.append("text")
        .attr("x", width * 2/6)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .style("font-weight", "bold")
        .text("Temperatura en " + ciudad);
}


/**
 * drawLinesCities: Funcion que permite representar un grafico de lineas multiple para las ciudades indicadas
 * @param {*} ciudad1 
 * @param {*} ciudad2 
 * @param {*} datos de los que se extraeran los de las ciudades indicadas
 */
function drawLinesCities(ciudad1, ciudad2, datos) {
    // Obtener los datos de las dos ciudades
    var TemperaturasCiudad1 = []; var TemperaturasCiudad2 = [];
    datos.forEach(function(d) {
        if (d.Ciudad == ciudad1) {
            TemperaturasCiudad1.push(d);
        } else if (d.Ciudad == ciudad2) {
            TemperaturasCiudad2.push(d);
        }
    });
    
    var GraficoLineas = document.getElementById("GraficoLineasCiudades");
    var margin = { top: 20, right: 20, bottom: 50, left: 50 };
    var width = GraficoLineas.clientWidth - margin.left - margin.right;
    var height = GraficoLineas.clientHeight - margin.top - margin.bottom;

    // Se elimina en caso de ya existir un grafico
    d3.selectAll("#GraficoLineasCiudadesSvg").remove();

    var svg = d3.select("#GraficoLineasCiudades")
        .append("svg")
        .attr("id", "GraficoLineasCiudadesSvg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + width / 5 + "," + margin.top + ")");

    // Escalas
    // Escala X
    var xScale = d3.scaleLinear()
        .domain(d3.extent(TemperaturasCiudad1, function(d) { return d.Year; }))
        .range([0, width / 1.5]);
    // Escala Y
    var yScale = d3.scaleLinear()
        .domain([
            d3.min([].concat(TemperaturasCiudad1, TemperaturasCiudad2), function(d) { return parseFloat(d.Media); }) - 0.1,
            d3.max([].concat(TemperaturasCiudad1, TemperaturasCiudad2), function(d) { return parseFloat(d.Media); }) + 0.1
        ])
        .range([height, 0]);

    // Línea para la primera ciudad
    var line1 = d3.line()
        .x(function(d) { return xScale(d.Year); })
        .y(function(d) { return yScale(d.Media); });
    // Ponemos la linea de la primera ciudad en el gráfico
    var path1 = svg.append("path")
        .data([TemperaturasCiudad1])
        .attr("class", "line")
        .attr("d", line1)
        .style("fill", "none")
        .style("stroke", "blue");

    // Línea para la segunda ciudad
    var line2 = d3.line()
        .x(function(d) { return xScale(d.Year); })
        .y(function(d) { return yScale(d.Media); });
    // Ponemos la linea de la primera ciudad en el gráfico
    var path2 = svg.append("path")
        .data([TemperaturasCiudad2])
        .attr("class", "line")
        .attr("d", line2)
        .style("fill", "none")
        .style("stroke", "red");


    // Hacemos una animación para ambas líneas
    var totalLength1 = path1.node().getTotalLength();
    var totalLength2 = path2.node().getTotalLength();
    path1
        .attr("stroke-dasharray", totalLength1 + " " + totalLength1)
        .attr("stroke-dashoffset", totalLength1)
        .transition()
        .duration(10000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
    path2
        .attr("stroke-dasharray", totalLength2 + " " + totalLength2)
        .attr("stroke-dashoffset", totalLength2)
        .transition()
        .duration(10000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    // Ejes
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (width * 2/6) + "," + (height + margin.bottom) + ")")
        .text("Años");
    svg.append("g")
        .attr("class", "y axis")
        .call(d3.axisLeft(yScale));
    svg.append("text")
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90) translate(" + -height / 2 + "," + -margin.left + ")")
        .text("Temperatura Media Anual (ºC)");

    // Ponemos un título
    svg.append("text")
        .attr("x", width * 2 / 6)
        .attr("y", 0)
        .attr("text-anchor", "middle")
        .style("font-size", "25px")
        .style("font-weight", "bold")
        .text("Temperatura en " + ciudad1 + " y " + ciudad2);
}





/**************************************************** Otros Eventos ****************************************************/
// Si se marca/desmarca el checkbox
var checkbox = document.getElementById("CheckboxTempGlobal");
checkbox.checked = false;
checkbox.addEventListener("change", function() {
    if (checkbox.checked) {
        drawGraficoLineasDoble(TemperaturaPais);

        var DivCheckbox = d3.select("#DivCheckbox")
            .append("svg")
            .attr("id", "CheckboxRect")
            .attr("width", 10)
            .attr("height", 10)
        DivCheckbox.append("rect")
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", "red")
            .style("stroke", "black")
            .style("stroke-width", "black");
    } else {
        d3.select("#CheckboxRect").remove();
        drawGraficoLineas(TemperaturaPais);
    }
});

/**
 * drawGraficoLineasDoble: Función que representa un grafico de lineas dobles utilizando los datos de temperaturas globales
 *                         y los recibidos por parametro
 * @param {*} datos que se representaran en el grafico
 */
function drawGraficoLineasDoble(datos) {
    d3.csv("./Datos/GlobalTemperaturesAnual.csv").then(function(datosGlobales){
        var GraficoLineas = document.getElementById("GraficoLineas");
        var margin = { top: 20, right: 20, bottom: 50, left: 50 };
        var width = GraficoLineas.clientWidth - margin.left - margin.right;
        var height = GraficoLineas.clientHeight - margin.top - margin.bottom;
            
        // Se elimina en caso de ya existir un grafico
        d3.selectAll("#GraficoLineasSvg").remove();

        // Creamos el svg para hacer el grafico
        var svg = d3.select("#GraficoLineas")
            .append("svg")
            .attr("id", "GraficoLineasSvg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + width/5 +"," + + margin.top + ")");
        
        // Escalas
        // Escala X
        var xScale = d3.scaleLinear()
            .domain(d3.extent(datosGlobales, function(d) { return d.Year;}))
            .range([0, width / 1.5]);
        // Escala Y
        var yScale = d3.scaleLinear()
            .domain([
                d3.min([].concat(datos, datosGlobales), function(d) { return parseFloat(d.Media); }) - 0.1,
                d3.max([].concat(datos, datosGlobales), function(d) { return parseFloat(d.Media); }) + 0.1
            ])
            .range([height, 0]);
        
        // Línea para los datos del pais
        var line1 = d3.line()
            .x(function(d) { return xScale(d.Year); })
            .y(function(d) { return yScale(d.Media); });
        // Ponemos la linea de los datos del país en el gráfico
        var path1 = svg.append("path")
            .data([datos])
            .attr("class", "line")
            .attr("d", line1)
            .style("fill", "none")
            .style("stroke", "black");

        // Línea para los datos globales
        var line2 = d3.line()
            .x(function(d) { return xScale(d.Year); })
            .y(function(d) { return yScale(d.Media); });
        // Ponemos la linea de la primera ciudad en el gráfico
        var path2 = svg.append("path")
            .data([datosGlobales])
            .attr("class", "line")
            .attr("d", line2)
            .style("fill", "none")
            .style("stroke", "red");

        // Hacemos una animación para ambas líneas
        var totalLength1 = path1.node().getTotalLength();
        var totalLength2 = path2.node().getTotalLength();
        path1
            .attr("stroke-dasharray", totalLength1 + " " + totalLength1)
            .attr("stroke-dashoffset", totalLength1)
            .transition()
            .duration(10000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);
        path2
            .attr("stroke-dasharray", totalLength2 + " " + totalLength2)
            .attr("stroke-dashoffset", totalLength2)
            .transition()
            .duration(10000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", 0);

        // Ejes
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xScale).tickFormat(d3.format("d")));
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(" + (width * 2/6) + "," + (height + margin.bottom) + ")")
            .text("Años");
        svg.append("g")
            .attr("class", "y axis")
            .call(d3.axisLeft(yScale));
        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90) translate(" + -height / 2 + "," + -margin.left + ")")
            .text("Temperatura Media Anual (ºC)");

        // Ponemos un título
        svg.append("text")
            .attr("x", width * 2 / 6)
            .attr("y", 0)
            .attr("text-anchor", "middle")
            .style("font-size", "25px")
            .style("font-weight", "bold")
            .text("Evolución de la temperatura");
    });    
}

// Si se cambia el valor del primer selector de ciudad
listaCiudades.addEventListener("change", function() {
    if(Nciudades>1){
        // Actualizamos los valores del otro selector para que no contenga al valor de este
        valorAnterior = listaCiudades2.value;
        while (listaCiudades2.options.length > 0) {
            listaCiudades2.remove(0);
        }
        NombresCiudades.forEach(function(ciudad) {
            if(ciudad.Ciudad != listaCiudades.value){
                var option = document.createElement("option");
                option.value = ciudad.Ciudad; 
                option.text = ciudad.Ciudad;
                listaCiudades2.appendChild(option);
            }
        });
        
        if(valorAnterior != listaCiudades.value){
            // Si el valor seleccionado no es el que estaba en el segundo selector se mantiene
            listaCiudades2.value = valorAnterior;
        } else {
            // Si se ha colocado el mismo valor se avisa de ello
            alert("Se ha introducido el mismo valor en ambos campos se ha modificado uno de ellos");
        }
        // Rehacemos el grafico
        drawLinesCities(listaCiudades.value, listaCiudades2.value, TemperaturasCiudadesPais);
    } else{
        // Rehacemos el grafico
        drawLinesCity(listaCiudades.value, TemperaturasCiudadesPais);
    }
    
});

// Si se cambia el valor del segundo selector de ciudad
listaCiudades2.addEventListener("change", function() {
    // No se puede poner el valor del primero porque no existe en el selector asi que solo rehacemos el grafico
    drawLinesCities(listaCiudades.value, listaCiudades2.value, TemperaturasCiudadesPais);
    
});

// Si se cambia el tamano de la ventana
window.addEventListener('resize', function() {
    checkbox.checked = false;
    // Rehacemos todos los graficos en función del numero de ciudades que tenemos
    if(Nciudades == 0){
        drawGraficoLineas(TemperaturaPais);        
    } else if(Nciudades == 1){
        drawGraficoLineas(TemperaturaPais);
        drawLinesCity(listaCiudades.value, TemperaturasCiudadesPais);
    } else {
        drawGraficoLineas(TemperaturaPais);
        drawLinesCities(listaCiudades.value, listaCiudades2.value, TemperaturasCiudadesPais);
    }
});
