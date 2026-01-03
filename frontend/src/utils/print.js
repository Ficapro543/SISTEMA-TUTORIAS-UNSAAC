/**
 * Imprime el contenido de un elemento específico del DOM.
 * @param {string} elementId - ID del elemento a imprimir.
 * @param {string} title - Título para la ventana de impresión.
 */
export function printElementById(elementId, title = 'Impresión') {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error(`Elemento con id "${elementId}" no encontrado.`);
        return;
    }

    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
        alert('Por favor, permita las ventanas emergentes para imprimir.');
        return;
    }

    const content = element.innerHTML;

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${title}</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 20px;
                    color: #333;
                }
                h1, h2, h3 {
                    text-align: center;
                    color: #000;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-top: 20px;
                    font-size: 12px;
                }
                th, td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                th {
                    background-color: #f2f2f2;
                    font-weight: bold;
                }
                tr:nth-child(even) {
                    background-color: #f9f9f9;
                }
                /* Ocultar elementos no deseados en impresión si se colaron */
                button, .no-print {
                    display: none !important;
                }
                /* Ajustes para mantener estilos básicos similares a la app si es necesario */
                .status-badge {
                    padding: 4px 8px;
                    border-radius: 4px;
                    font-size: 0.85em;
                    font-weight: bold;
                }
            </style>
        </head>
        <body>
            <h2>${title}</h2>
            ${content}
            <script>
                window.onload = function() {
                    window.print();
                    // Opcional: cerrar después de imprimir. Algunos navegadores bloquean esto si no es inmediato.
                    // window.close(); 
                }
            </script>
        </body>
        </html>
    `);

    printWindow.document.close();
}
