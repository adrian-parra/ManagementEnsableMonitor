/**
 * Módulo para gestionar las peticiones HTTP
 * @namespace API
 */
export const API = {
    /**
     * Realiza una petición GET
     * @param {string} url - URL de la petición
     * @param {Object} [params={}] - Parámetros de la petición
     * @returns {Promise<any>} Respuesta de la petición
     * @throws {Error} Error en caso de fallo en la petición
     */
    async get(url, params = {}) {
        try {
            // Construir URL con parámetros
            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value);
                }
            });
            
            const queryString = queryParams.toString();
            const fullUrl = queryString ? `${url}?${queryString}` : url;
            
            AppState.setLoading(true);
            const response = await fetch(fullUrl);
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            
            // Intentar parsear la respuesta como JSON
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
                // Intentar parsear el texto como JSON
                if (data && data.trim() !== '') {
                    try {
                        data = JSON.parse(data);
                    } catch (e) {
                        // Si no es JSON, mantener como texto
                    }
                }
            }
            
            return data;
        } catch (error) {
            console.error('Error en petición GET:', error);
            throw error;
        } finally {
            AppState.setLoading(false);
        }
    },
    
    /**
     * Realiza una petición POST
     * @param {string} url - URL de la petición
     * @param {Object} data - Datos a enviar
     * @returns {Promise<any>} Respuesta de la petición
     * @throws {Error} Error en caso de fallo en la petición
     */
    async post(url, data) {
        try {
            AppState.setLoading(true);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
            }
            
            // Intentar parsear la respuesta como JSON
            let responseData;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
                // Intentar parsear el texto como JSON
                if (responseData && responseData.trim() !== '') {
                    try {
                        responseData = JSON.parse(responseData);
                    } catch (e) {
                        // Si no es JSON, mantener como texto
                    }
                }
            }
            
            return responseData;
        } catch (error) {
            console.error('Error en petición POST:', error);
            throw error;
        } finally {
            AppState.setLoading(false);
        }
    }
};


/**
 * Módulo para gestionar la interfaz de usuario
 * @namespace UI
 */
export const UI = {
    /**
     * Muestra un mensaje de alerta al usuario
     * @param {string} message - Mensaje a mostrar
     * @param {string} [type='info'] - Tipo de alerta ('info', 'success', 'warning', 'error')
     */
    showAlert(message, type = 'info') {
        // En una versión más avanzada, se podría implementar un sistema de notificaciones
        // más sofisticado en lugar de usar alert()
        alert(message);
    },
    
    /**
     * Actualiza el estado visual de un elemento
     * @param {string} elementId - ID del elemento a actualizar
     * @param {Object} options - Opciones de actualización
     * @param {boolean} [options.disabled] - Si el elemento debe estar deshabilitado
     * @param {string} [options.value] - Valor a establecer en el elemento
     * @param {string} [options.html] - HTML a establecer en el elemento
     * @param {string} [options.display] - Estilo de visualización del elemento
     */
    updateElement(elementId, options = {}) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (options.disabled !== undefined) element.disabled = options.disabled;
        if (options.value !== undefined) element.value = options.value;
        if (options.html !== undefined) element.innerHTML = options.html;
        if (options.display !== undefined) element.style.display = options.display;
        if (options.readonly !== undefined) element.readOnly = options.readonly;
    },
    
    /**
     * Cierra un modal de Bootstrap
     * @param {string} modalId - ID del modal a cerrar
     */
    closeModal(modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) return;
        
        try {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) {
                modal.hide();
            } else {
                // Alternativa usando jQuery si bootstrap no está disponible directamente
                $(modalElement).modal('hide');
            }
        } catch (error) {
            console.error(`Error al cerrar el modal ${modalId}:`, error);
        }
    },
    
    /**
     * Limpia un formulario
     * @param {string} formId - ID del formulario a limpiar
     */
    resetForm(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    }
};

/**
 * Estado global de la aplicación
 * @type {Object}
 */
export const AppState = {

    department:null,

    /**
     * Información del usuario actual
     * @type {Object|null}
     */
    currentUser: null,
    
    /**
     * Planta seleccionada actualmente
     * @type {string|null}
     */
    selectedPlant: null,
    
    /**
     * Línea seleccionada actualmente
     * @type {string|null}
     */
    selectedLine: null,
    
    /**
     * Indica si la aplicación está en un estado de carga
     * @type {boolean}
     */
    isLoading: false,
    
    /**
     * Establece el estado de carga de la aplicación
     * @param {boolean} loading - Estado de carga
     */
    setLoading(loading) {
        this.isLoading = loading;
        // Aquí se podría implementar lógica para mostrar/ocultar un indicador de carga global
    }
};