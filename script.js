function generateKML() {
    const fileName = document.getElementById("fileNameInput").value.trim();
    if (!fileName) {
        alert("Пожалуйста, введите название файла.");
        return;
    }

    let input = document.getElementById("coordinatesInput").value.trim();
    let coordinatesList = [];

    try {

        const lines = input.split('\n').filter(line => line.trim() !== '');

        if (lines.length === 0) {
            throw new Error("Не найдено ни одного массива полигонов.");
        }

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();
            try {
                const parsed = JSON.parse(trimmedLine);


                const extractPolygon = (data) => {
                    if (!Array.isArray(data)) {
                        throw new Error("Полигон должен быть массивом точек.");
                    }

                    if (Array.isArray(data[0][0])) {

                        return data[0];
                    } else {
                        return data;
                    }
                };

                const polygon = extractPolygon(parsed);


                if (!Array.isArray(polygon) || polygon.length === 0) {
                    throw new Error(`Неверная структура данных для полигона ${index + 1}.`);
                }

                polygon.forEach((point, pointIndex) => {
                    if (!Array.isArray(point) || point.length < 2) {
                        throw new Error(`Неверная структура координаты в полигоне ${index + 1}, точка ${pointIndex + 1}.`);
                    }

                    if (typeof point[0] !== 'number' || typeof point[1] !== 'number') {
                        throw new Error(`Координаты должны быть числами в полигоне ${index + 1}, точка ${pointIndex + 1}.`);
                    }
                });

                coordinatesList.push(polygon);
            } catch (e) {
                throw new Error(`Ошибка при разборе полигона ${index + 1}: ${e.message}`);
            }
        });

        if (coordinatesList.length === 0) {
            throw new Error("Не удалось разобрать ни одного корректного полигона.");
        }

    } catch (e) {
        alert("Неверный формат координат. Убедитесь, что это корректный JSON.\n" + e.message);
        return;
    }

    // Формирование KML-контента
    let kmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
<name>Карта с координатами</name>`;

    coordinatesList.forEach((polygon, index) => {
        const firstPoint = polygon[0];
        kmlContent += `
<Placemark>
  <name>Полигон ${index + 1}</name>
  <Polygon>
    <outerBoundaryIs>
      <LinearRing>
        <coordinates>`;


        polygon.forEach(([lon, lat]) => {
            kmlContent += `${lon},${lat},0 `;
        });


        kmlContent += `${firstPoint[0]},${firstPoint[1]},0`;

        kmlContent += `</coordinates>
      </LinearRing>
    </outerBoundaryIs>
  </Polygon>
</Placemark>`;
    });

    kmlContent += `
</Document>
</kml>`;


    const blob = new Blob([kmlContent], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.kml`;
    document.body.appendChild(link); 
    link.click();
    document.body.removeChild(link); 
    URL.revokeObjectURL(url);
}