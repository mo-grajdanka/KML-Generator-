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

       // console.log(`Обнаружено ${lines.length} строк(и) с координатами.`);

        if (lines.length === 0) {
            throw new Error("Не найдено ни одного массива полигонов.");
        }

        lines.forEach((line, index) => {
            const trimmedLine = line.trim();

            const cleanedLine = trimmedLine.replace(/^["']+|["']+$/g, '');

          //  console.log(`\nОбрабатывается полигон ${index + 1}:`);
           // console.log(`Исходная строка: ${trimmedLine}`);
          //  console.log(`Очистка кавычек: ${cleanedLine}`);

            if (!cleanedLine) {
              //  console.warn(`Пустая строка после очистки кавычек для полигона ${index + 1}. Пропуск.`);
                return; // Пропускаем этот полигон
            }

            try {
                const parsed = JSON.parse(cleanedLine);
              //  console.log(`Парсинг JSON успешен для полигона ${index + 1}:`, parsed);

                const extractPolygon = (data) => {
                    if (!Array.isArray(data)) {
                        throw new Error("Полигон должен быть массивом точек.");
                    }

                    if (data.length > 0 && Array.isArray(data[0]) && Array.isArray(data[0][0])) {
                        // Тройная вложенность, берем первый массив
                      //  console.log(`Тройная вложенность обнаружена для полигона ${index + 1}.`);
                        return data[0];
                    } else {
                        // Двойная вложенность или прямой массив
                      //  console.log(`Двойная вложенность или прямой массив для полигона ${index + 1}.`);
                        return data;
                    }
                };

                const polygon = extractPolygon(parsed);
              //  console.log(`Извлечённый полигон ${index + 1}:`, polygon);

                if (!Array.isArray(polygon) || polygon.length === 0) {
                    throw new Error(`Неверная структура данных для полигона ${index + 1}.`);
                }

                polygon.forEach((point, pointIndex) => {
                   // console.log(`\nПроверка точки ${pointIndex + 1} в полигоне ${index + 1}:`, point);

                    if (!Array.isArray(point) || point.length < 2) {
                        throw new Error(`Неверная структура координаты в полигоне ${index + 1}, точка ${pointIndex + 1}.`);
                    }

                    const lon = typeof point[0] === 'string' ? parseFloat(point[0]) : point[0];
                    const lat = typeof point[1] === 'string' ? parseFloat(point[1]) : point[1];

                  //  console.log(`Преобразованные координаты точки ${pointIndex + 1}: долгота=${lon}, широта=${lat}`);

                    if (isNaN(lon) || isNaN(lat)) {
                        throw new Error(`Координаты должны быть числами в полигоне ${index + 1}, точка ${pointIndex + 1}.`);
                    }

                    point[0] = lon;
                    point[1] = lat;
                });

                coordinatesList.push(polygon);
              //  console.log(`Полигоны после добавления полигона ${index + 1}:`, coordinatesList);
            } catch (e) {
                console.error(`Ошибка при разборе полигона ${index + 1}: ${e.message}`);
                throw new Error(`Ошибка при разборе полигона ${index + 1}: ${e.message}`);
            }
        });

        if (coordinatesList.length === 0) {
            throw new Error("Не удалось разобрать ни одного корректного полигона.");
        }

    } catch (e) {
        alert("Неверный формат координат. Убедитесь, что это корректный JSON.\n" + e.message);
        console.error("Общая ошибка:", e.message);
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

   // console.log("KML-файл успешно сгенерирован и скачан.");
}
