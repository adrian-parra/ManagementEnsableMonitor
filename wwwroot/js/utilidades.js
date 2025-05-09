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
     * Muestra un mensaje de alerta al usuario usando SweetAlert
     * @param {string} message - Mensaje a mostrar
     * @param {string} [type='info'] - Tipo de alerta ('info', 'success', 'warning', 'error')
     */
    showAlert(message, type = 'info', delay = 2000) {
        // Usar SweetAlert para mostrar notificaciones más atractivas
        Swal.fire({
            title: this.getTitleByType(type),
            text: message,
            icon: type,
            timer: delay,
            timerProgressBar: true,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: this.getColorByType(type)
        });
    },

    /**
     * Obtiene el título según el tipo de alerta
     * @private
     * @param {string} type - Tipo de alerta
     * @returns {string} Título correspondiente
     */
    getTitleByType(type) {
        switch (type) {
            case 'success': return '¡Éxito!';
            case 'error': return 'Error';
            case 'warning': return 'Advertencia';
            default: return 'Información';
        }
    },

    /**
     * Obtiene el color del botón según el tipo de alerta
     * @private
     * @param {string} type - Tipo de alerta
     * @returns {string} Color en formato hexadecimal
     */
    getColorByType(type) {
        switch (type) {
            case 'success': return '#28a745';
            case 'error': return '#dc3545';
            case 'warning': return '#ffc107';
            default: return '#17a2b8';
        }
    },

    /**
 * Hace que un modal sea arrastrable por su cabecera
 * @param {string} modalId - El ID del modal que se hará arrastrable
 */
    makeModalDraggable(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;

        const modalDialog = modal.querySelector('.modal-dialog');
        if (!modalDialog) return;

        const modalHeader = modal.querySelector('.modal-header');

        modalHeader.classList.add('cursor-move');

        let isDragging = false;
        let offsetX, offsetY;
        let originalWidth, originalHeight;

        // Función para iniciar el arrastre
        const startDrag = function (e) {
            // Solo permitir arrastre desde el encabezado del modal
            const modalHeader = modalDialog.querySelector('.modal-header');
            if (modalHeader && modalHeader.contains(e.target) && !e.target.closest('button')) {
                isDragging = true;

                // Guardar dimensiones originales
                originalWidth = modalDialog.offsetWidth + 'px';
                originalHeight = modalDialog.offsetHeight + 'px';

                // Calcular el desplazamiento del ratón
                const rect = modalDialog.getBoundingClientRect();
                offsetX = e.clientX - rect.left;
                offsetY = e.clientY - rect.top;

                // Añadir clase de arrastre
                modalDialog.classList.add('modal-dragging');

                // Prevenir selección de texto durante el arrastre
                document.body.style.userSelect = 'none';

                // Fijar el ancho y alto para evitar que se redimensione
                modalDialog.style.width = originalWidth;
                modalDialog.style.height = originalHeight;
            }
        };

        // Función para realizar el arrastre
        const drag = function (e) {
            if (!isDragging) return;

            // Calcular nueva posición
            const x = e.clientX - offsetX;
            const y = e.clientY - offsetY;

            // Permitir movimiento incluso fuera de la ventana visible
            // pero con un margen mínimo para que siempre sea accesible
            const minMargin = 50; // Píxeles mínimos visibles
            const maxX = window.innerWidth - minMargin;
            const maxY = window.innerHeight - minMargin;

            const newX = Math.max(-modalDialog.offsetWidth + minMargin, Math.min(x, maxX));
            const newY = Math.max(0, Math.min(y, maxY));

            // Aplicar nueva posición
            modalDialog.style.position = 'fixed';
            modalDialog.style.margin = '0';
            modalDialog.style.left = newX + 'px';
            modalDialog.style.top = newY + 'px';

            // Mantener dimensiones originales
            modalDialog.style.width = originalWidth;
            modalDialog.style.height = originalHeight;

            // Prevenir eventos predeterminados para evitar comportamientos inesperados
            e.preventDefault();
        };

        // Función para finalizar el arrastre
        const endDrag = function () {
            if (isDragging) {
                isDragging = false;
                modalDialog.classList.remove('modal-dragging');
                document.body.style.userSelect = '';

                // Asegurarse de que el modal siga siendo accesible
                const rect = modalDialog.getBoundingClientRect();
                const minMargin = 50;

                if (rect.right < minMargin) {
                    modalDialog.style.left = (minMargin - modalDialog.offsetWidth) + 'px';
                }

                if (rect.bottom < minMargin) {
                    modalDialog.style.top = (minMargin - modalDialog.offsetHeight) + 'px';
                }
            }
        };

        // Registrar eventos cuando se muestra el modal
        modal.addEventListener('shown.bs.modal', function () {
            modalDialog.addEventListener('mousedown', startDrag);
            document.addEventListener('mousemove', drag);
            document.addEventListener('mouseup', endDrag);
        });

        // Eliminar eventos cuando se oculta el modal
        modal.addEventListener('hidden.bs.modal', function () {
            modalDialog.removeEventListener('mousedown', startDrag);
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', endDrag);

            // Restablecer posición y dimensiones para la próxima vez
            modalDialog.style.position = '';
            modalDialog.style.margin = '';
            modalDialog.style.left = '';
            modalDialog.style.top = '';
            modalDialog.style.width = '';
            modalDialog.style.height = '';
        });
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

    department: null,

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

