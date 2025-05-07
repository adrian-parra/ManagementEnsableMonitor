// ... existing code ...

/**
 * Envía una solicitud para gestionar una línea
 * @param {Object} data - Datos de la línea a gestionar
 * @returns {Promise<Object>} - Respuesta del servidor
 */
export async function postManagerLine(data) {
    try {
        const response = await fetch('/api/assemblymonitor/PostManagerLine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`Error: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error en postManagerLine:', error);
        throw error;
    }
}

// ... existing code ...