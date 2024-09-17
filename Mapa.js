// Javier Ramos Jimeno

/************************************************ Temperatura Global ***************************************************/
// Cargamos el valor de la temperatura media global
var TemperaturaGlobal; var TemperaturaGlobalReady = false;
var deslizadorYear = document.getElementById("DeslizadorYear");
d3.csv("./Datos/GlobalTemperaturesAnual.csv").then(function(datos){
    TemperaturaGlobal = datos;     
    TemperaturaGlobalReady = true;

    if(TemperaturaGlobalReady){
        TemperaturaGlobal.forEach(function(d){
            if(deslizadorYear.value == d.Year){
                valorTemperatura = d.Media; 
            }
        });

        TextoTemperaturaGlobal = document.getElementById("TemperaturaGlobal");
        TextoTemperaturaGlobal.textContent = valorTemperatura + " ºC";
    }

});





/******************************************************** Mapa *********************************************************/
// Cargamos los datos de temperatura para los diferentes paises
var TemperaturaGlobalPais;  var TemperaturaGlobalPaisReady = false; var TemperaturaGlobalPaisAno;
document.addEventListener('DOMContentLoaded', function () {
    d3.csv("./Datos/GlobalLandTemperaturesByCountryAnual.csv").then(function(datos){
        TemperaturaGlobalPais = datos;     
        TemperaturaGlobalPaisReady = true;
        
        // Creamos un archivo con los datos de temperatura del ano en el que nos encontramos
        TemperaturaGlobalPaisAno = TemperaturaGlobalPais.filter(function (fila) {
            return fila.Year === deslizadorYear.value;
        });;

        // Dibujamos el mapa
        drawMap();
    });     
});

/**
 * drawMap: Función que dibuja un mapa del mundo en el elemento DivMapa
 * Se necesita utilizar un archivo de coordenadas geográficas que se utilizará para hacer la representación
 * Es necesario disponer de los datos que se utilizan para representar en el mapa (TemperaturaGlobalPaisAno)
 */
function drawMap() {
    d3.json("./DatosMapa/countries.geojson").then(function (geojson) {
        // Configuración del mapa
        var DivMapa = document.getElementById("DivMapa");
        var width = DivMapa.clientWidth;
        var height = DivMapa.clientHeight;
        
        // Eliminamos mapas anteriores    
        d3.selectAll("#Mapa").remove();
        d3.selectAll("#leyenda").remove();
        d3.selectAll("#tooltipPaises").remove();
        
        // Creamos el svg
        var svg = d3.select("#DivMapa")
            .append("svg")
            .attr("id", "Mapa")
            .attr("width", width)
            .attr("height", height);

        // Configuración de la proyección
        var projection = d3.geoMercator()
            .scale(150)
            .translate([width/2, height/2]);
        var path = d3.geoPath().projection(projection);

        // Creamos la escala de color en función de las diferentes temperaturas
        var colorScale = d3.scaleLinear()
            .domain([
                d3.min(TemperaturaGlobalPaisAno, d => parseFloat(d.Media)),
                d3.mean(TemperaturaGlobalPaisAno, d => parseFloat(d.Media)),
                d3.max(TemperaturaGlobalPaisAno, d => parseFloat(d.Media))
            ])
            .range(["blue", "green", "red"]);

        // Dibujamos los diferentes paises utilizando la escala de colores anterior
        svg.selectAll("path")
            .data(geojson.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("fill", function(d) {
                // Buscamos el país en el fichero de temperatura
                var paisData = TemperaturaGlobalPaisAno.find(function(elemento) {
                    return elemento.Pais === d.properties.ADMIN;
                });
                // Si no se encuentra el país en los datos coloreamos en gris
                if (!paisData) {
                    return "rgb(85, 85, 85)";
                }
                // Se encuentra el país, se aplica el color en función de la escala
                return colorScale(parseFloat(paisData.Media));
            })
            .style("stroke", "black")
            .style("stroke-width", 0.25)
            .on("mouseover", function(event, d) {
                // Marcamos más el país sobre el que estamos
                d3.select(this)
                    .style("stroke-width", 0.75)
                    .style("cursor", "pointer")
                    .style("filter", "drop-shadow(0 0 15px yellow");

                // Queremos mostrar el valor de temperatura que se tiene en cada país al pasar por encima
                // Buscamos el país sobre el que estamos
                var nombrePais = d.properties.ADMIN;
                var paisData = TemperaturaGlobalPaisAno.find(function(elemento) {
                    return elemento.Pais === nombrePais;
                });
                
                // Mostramos el valor de la temperatura
                var tooltip = d3.select("#DivMapa")
                    .append("div")
                    .attr("class", "tooltip")
                    .attr("id", "tooltipPaises")
                    .style("left", event.pageX + "px")
                    .style("top", event.pageY + "px");                
                if (!paisData) {
                    tooltip.html("<strong>" + nombrePais + "</strong><br>No se dispone de la temperatura")
                    .style("opacity", 1);
                } else {
                    tooltip.html("<strong>" + paisData.Pais + "</strong><br>Temperatura: " + paisData.Media + " ºC")
                    .style("opacity", 1);
                }

                // Añadimos un texto encima del país
                svg.append("rect")
                    .attr("class", "background-rect")
                    .attr("x", path.centroid(d)[0] - (nombrePais.length * 4.5) + 30)
                    .attr("y", path.centroid(d)[1])
                    .attr("width", nombrePais.length * 9)
                    .attr("height", 20)
                    .attr("rx", 5) 
                    .attr("ry", 5)
                    .style("fill", "white")
                    .style("opacity", 0.5);
                svg.append("text")
                    .attr("class", "hover-text")
                    .attr("x", path.centroid(d)[0] + 30)
                    .attr("y", path.centroid(d)[1] + 25)
                    .attr("text-anchor", "middle")
                    .attr("dy", -10)
                    .text(nombrePais)
                    .style("opacity", 0.8);
                
            })
            .on("mouseout", function() {
                // Eliminamos la temperatura si nos desplazamos fuera del pais
                d3.select(".tooltip").remove();

                // Devolvemos las propiedades
                d3.select(this)
                    .style("stroke-width", 0.25)
                    .style("filter", "none");

                // Eliminamos el texto al salir del país
                svg.select(".background-rect").remove();
                svg.select(".hover-text").remove();  
            })
            .on("click", function(event, d) {
                // Guardamos el pais sobre el que hemos hecho click
                var nombrePais = d.properties.ADMIN;
                var paisData = TemperaturaGlobalPaisAno.find(function(elemento) {
                    return elemento.Pais === nombrePais;
                });

                if(paisData){
                    // Si hacemos click en un pais con datos mostramos graficos adicionales
                    window.location.href = "GraficosPais.html?pais=" + encodeURIComponent(nombrePais);
                } else {
                    // No tenemos datos que mostrar
                    alert("No se dispone de datos sobre el pais seleccionado (" + nombrePais + ")");
                } 
            });
        // Creamos una leyenda con la escala de colores utilizada
        drawLegend(colorScale);    
    });
}

/**
 * updateMap: Función que actualiza los valores de un mapa del mundo
 * @param {*} newData Archivo con los nuevos datos que se desea utilizar en el mapa
 */
function updateMap(newData) {
    // Actualizar el dominio de la escala de colores con los nuevos datos
    var colorScale = d3.scaleLinear()
        .domain([
            d3.min(newData, d => parseFloat(d.Media)),
            d3.mean(newData, d => parseFloat(d.Media)),
            d3.max(newData, d => parseFloat(d.Media))
        ])
        .range(["blue", "green", "red"]);

    // Seleccionar el SVG existente
    var svg = d3.select("#Mapa");

    // Actualizar los colores de los países en el mapa
    svg.selectAll("path")
        .style("fill", function(d) {
            // Buscar el país en el nuevo conjunto de datos
            var paisData = newData.find(function(elemento) {
                return elemento.Pais === d.properties.ADMIN;
            });

            // Si no se encuentra el país en los nuevos datos
            if (!paisData) {
                return "rgb(85, 85, 85)";
            }

            // Se encuentra el país, se aplica el nuevo color
            return colorScale(parseFloat(paisData.Media));
        });
    // Se actualiza la leyenda
    d3.select("#leyenda").remove();
    drawLegend(colorScale);
}

/**
 * drawLegend: Función que crea una leyenda para el mapa en función de la escala de colores utilizada
 * @param {*} colorScale Escala de colores de la que se quiere hacer la leyenda
 * (La leyenda se colocará en la parte de abajo a la izquierda del mapa)
 */
function drawLegend(colorScale) {
    var legend = d3.select("#Mapa")
        .append("g")
        .attr("class", "legend")
        .attr("id", "leyenda")
        .attr("transform", "translate(20,20)");

    // Indicamos el número de elementos que queremos en la leyenda
    var Nticks = 10;
    var legendData = colorScale.ticks(Nticks).map(function(d) {
        return {
            value: d,
            color: colorScale(d)
        };
    });

    var legendRectSize = 15;
    var legendSpacing = 0;    
    var DivMapa = document.getElementById("DivMapa");
    var heightLeyenda = DivMapa.clientHeight - Nticks*legendRectSize - DivMapa.clientHeight / Nticks;

    // Creamos la leyenda con los colores y los textos
    legend.selectAll("rect")
        .data(legendData)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d, i) {
            return i * (legendRectSize + legendSpacing) + heightLeyenda;
        })
        .attr("width", legendRectSize)
        .attr("height", legendRectSize)
        .style("fill", function(d) {
            return d.color;
        });
    legend.selectAll("text")
        .data(legendData)
        .enter()
        .append("text")
        .attr("x", legendRectSize + legendSpacing + 10)
        .attr("y", function(d, i) {
            return i * (legendRectSize + legendSpacing) + legendRectSize / 2 + heightLeyenda;
        })
        .attr("dy", "0.35em")
        .style("text-anchor", "start")
        .text(function(d) {
            return d.value.toFixed(2);
        });
    // Añadir título a la leyenda
    legend.append("text")
        .attr("x", 0)
        .attr("y", -10 + heightLeyenda)
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .text("Temperatura Media Anual");
}





/************************************************** Barra deslizadora **************************************************/
// Mostrar el valor inicial
var YearSeleccionado = document.getElementById("YearSeleccionado");
YearSeleccionado.textContent = deslizadorYear.value;
var posicionXInicial = calcularPosicionX(deslizadorYear);
actualizarPosicionYearSeleccionado(posicionXInicial);
// Cuando se cambia la posición del deslizador actualizar los valores correspondientes
deslizadorYear.addEventListener('input', function() {
    var valorTemperatura;
    YearSeleccionado.textContent = deslizadorYear.value;

    // Recolocamos la posicion
    var posicionX = calcularPosicionX(deslizadorYear);
    actualizarPosicionYearSeleccionado(posicionX);

    // Actualizamos el valor de la temperatura global
    if(TemperaturaGlobalReady){
        TemperaturaGlobal.forEach(function(d){
            if(deslizadorYear.value == d.Year){
                valorTemperatura = d.Media; 
            }
        });
        TextoTemperaturaGlobal = document.getElementById("TemperaturaGlobal");
        TextoTemperaturaGlobal.textContent = valorTemperatura + " ºC";
    }

    // Se actualiza el archivo de datos con el año seleccionado
    if(TemperaturaGlobalPaisReady){
        TemperaturaGlobalPaisAno = TemperaturaGlobalPais.filter(function (fila) {
            return fila.Year === deslizadorYear.value;
        });;        
        // Dibujar el mapa nuevamente
        updateMap(TemperaturaGlobalPaisAno);
    }
});

// Funciones utilizadas para colocar el texto del año seleccionado en la posición correcta
/**
 * calcularPosicionX: Funcion que nos permite calcular la posicion en la que se encuentra el deslizador
 * @param {*} deslizador del que queremos calcular la posicion
 * @returns posicion en la que se encuentra
 */
function calcularPosicionX(deslizador) {
    var valor = deslizador.value;
    var min = deslizador.min;
    var max = deslizador.max;
    var anchoTotal = deslizador.offsetWidth;
    return ((valor - min) / (max - min)) * anchoTotal;
}

/**
 * Actualiza la posición del texto que indica el valor del deslizador
 * @param {*} posicionX a la que desplazar el texto
 */
function actualizarPosicionYearSeleccionado(posicionX) {
    YearSeleccionado.style.left = `${posicionX}px`;
}

/**************************************************** Otros Eventos ****************************************************/
// Si se cambia el tamano de la ventana
window.addEventListener('resize', function() {
    // Actualizamos la posicion del texto
    var posicionX = calcularPosicionX(deslizadorYear);
    actualizarPosicionYearSeleccionado(posicionX); 
    // Rehacemos el mapa
    drawMap();
});


