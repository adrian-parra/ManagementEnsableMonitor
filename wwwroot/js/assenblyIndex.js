
/**
 * @fileoverview Módulo principal para la gestión de la aplicación de monitoreo de ensamble
 * @author Adrian Borquez
 * @version 1.0.0
 */

/**
 * Estado global de la aplicación
 * @type {Object}
 */
const AppState = {
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

/**
 * Módulo para gestionar la interfaz de usuario
 * @namespace UI
 */
const UI = {
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
 * Módulo para gestionar las peticiones HTTP
 * @namespace API
 */
const API = {
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
 * Módulo para gestionar la información del usuario
 * @namespace UserService
 */
const UserService = {
    /**
     * Obtiene la información del usuario actual
     * @returns {Promise<Object|null>} Información del usuario
     */
    async getCurrentUser() {
        try {
            if (AppState.currentUser) {
                return AppState.currentUser;
            }
            
            const userDomain = await API.get('/Home/GetUserDomain');
            
            // Actualizar el estado global
            AppState.currentUser = userDomain;
            
            // Actualizar la interfaz de usuario
            const userNameDisplay = document.getElementById('userNameDisplay');
            if (userNameDisplay && userDomain && userDomain.userName) {
                userNameDisplay.textContent = userDomain.userName;
            }
            
            return userDomain;
        } catch (error) {
            console.error('Error al obtener información del usuario:', error);
            
            // Actualizar la interfaz de usuario en caso de error
            const userNameDisplay = document.getElementById('userNameDisplay');
            if (userNameDisplay) {
                userNameDisplay.textContent = 'No disponible';
            }
            
            return null;
        }
    }
};

/**
 * Módulo para gestionar las plantas
 * @namespace PlantService
 */
const PlantService = {
    /**
     * Obtiene todas las plantas disponibles
     * @returns {Promise<Array>} Lista de plantas
     */
    async getPlants() {
        try {
            return await API.get('/Home/GetPlants');
        } catch (error) {
            UI.showAlert('No se pudieron cargar las plantas. Por favor, intente nuevamente más tarde.', 'error');
            throw error;
        }
    },
    
    /**
     * Obtiene las líneas de una planta
     * @param {string} plantId - ID de la planta
     * @returns {Promise<Array>} Lista de líneas
     */
    async getLines(plantId) {
        try {
            return await API.get('/Home/GetLines', { plant_id: plantId });
        } catch (error) {
            UI.showAlert('No se pudieron cargar las líneas. Por favor, intente nuevamente más tarde.', 'error');
            throw error;
        }
    },
    
    /**
     * Obtiene el tipo de gerente de una planta
     * @param {string} plant - ID de la planta
     * @returns {Promise<Object|null>} Tipo de gerente
     */
    async getManagerType(plant) {
        try {
            if (!plant) {
                throw new Error('Se requiere especificar una planta');
            }
            
            return await API.get('/api/assemblymonitor/GetManagerType', { plant });
        } catch (error) {
            UI.showAlert('No se pudo obtener el tipo de gerente. Por favor, intente nuevamente más tarde.', 'error');
            return null;
        }
    }
};

/**
 * Módulo para gestionar los empleados
 * @namespace EmployeeService
 */
const EmployeeService = {
    /**
     * Obtiene la información de un empleado por su número de reloj
     * @param {string} reloj - Número de reloj del empleado
     * @returns {Promise<Object|null>} Información del empleado
     */
    async getEmployee(reloj) {
        try {
            if (!reloj) {
                UI.showAlert('Por favor, ingrese un número de reloj válido.', 'warning');
                return null;
            }
            
            // Actualizar la interfaz para mostrar que se está buscando
            const inputRelojUsuario = document.getElementById('inputRelojUsuario');
            const valorOriginal = inputRelojUsuario ? inputRelojUsuario.value : '';
            
            if (inputRelojUsuario) {
                UI.updateElement('inputRelojUsuario', {
                    disabled: true,
                    value: 'Buscando...'
                });
            }
            
            // Realizar la petición
            const empleado = await API.get('/Empleado/GetEmployee', { reloj });
            
            // Restaurar el campo
            if (inputRelojUsuario) {
                UI.updateElement('inputRelojUsuario', {
                    disabled: false,
                    value: valorOriginal
                });
            }
            
            // Verificar si hay errores en la respuesta
            if (empleado && empleado.errorMsj) {
                UI.showAlert(`Error: ${empleado.errorMsj}`, 'error');
                return null;
            }
            
            // Mostrar información del empleado
            if (empleado && empleado.nombre) {
                UI.showAlert(`Empleado encontrado: ${empleado.nombre}`, 'success');
            }
            
            return empleado;
        } catch (error) {
            console.error('Error al obtener información del empleado:', error);
            
            // Restaurar el campo en caso de error
            const inputRelojUsuario = document.getElementById('inputRelojUsuario');
            if (inputRelojUsuario) {
                inputRelojUsuario.disabled = false;
                inputRelojUsuario.value = reloj || '';
            }
            
            UI.showAlert('No se pudo obtener la información del empleado. Por favor, intente nuevamente más tarde.', 'error');
            return null;
        }
    }
};

/**
 * Módulo para gestionar las imágenes
 * @namespace ImageService
 */
const ImageService = {
    /**
     * Sube una imagen del carro de línea
     * @returns {Promise<void>}
     */
    async uploadCarImage() {
        try {
            // Obtener referencias a elementos del DOM
            const fileInput = document.getElementById('inputImagenCarro');
            const selectPlanta = document.getElementById('selectPlanta');
            const selectLinea = document.getElementById('selectLinea');
            const btnSubirImagen = document.getElementById('btnSubirImagen');
            
            // Validaciones
            if (!selectPlanta.value) {
                UI.showAlert('Por favor, seleccione una planta.', 'warning');
                return;
            }
            
            if (!selectLinea.value) {
                UI.showAlert('Por favor, seleccione una línea.', 'warning');
                return;
            }
            
            if (!fileInput.files || fileInput.files.length === 0) {
                UI.showAlert('Por favor, seleccione una imagen.', 'warning');
                return;
            }
            
            const file = fileInput.files[0];
            
            if (!file.type.startsWith('image/')) {
                UI.showAlert('Por favor, seleccione un archivo de imagen válido.', 'warning');
                return;
            }
            
            // Mostrar indicador de carga
            const originalText = btnSubirImagen.innerHTML;
            UI.updateElement('btnSubirImagen', {
                disabled: true,
                html: '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subiendo...'
            });
            
            // Convertir la imagen a Base64
            const base64String = await this.fileToBase64(file);
            
            // Obtener información del usuario
            const userDomain = await UserService.getCurrentUser();
            
            // Crear el objeto de solicitud
            const request = {
                plant: selectPlanta.value,
                lineId: selectLinea.value,
                imageBase64: base64String.split(',')[1], // Eliminar el prefijo "data:image/jpeg;base64,"
                registerUser: userDomain && userDomain.userName ? userDomain.userName : 'usuario_desconocido'
            };
            
            // Enviar la solicitud al servidor
            const result = await API.post('/Home/PostImageCar', request);
            
            // Restaurar el botón
            UI.updateElement('btnSubirImagen', {
                disabled: false,
                html: originalText
            });
            
            // Mostrar mensaje de éxito
            UI.showAlert(result && result.msj ? result.msj : 'Imagen subida correctamente', 'success');
            
            // Cerrar el modal y limpiar el formulario
            UI.closeModal('modalCargarImagen');
            UI.resetForm('formCargarImagen');
            UI.updateElement('previewContainer', { display: 'none' });
            
        } catch (error) {
            console.error('Error al subir la imagen:', error);
            
            // Restaurar el botón en caso de error
            const btnSubirImagen = document.getElementById('btnSubirImagen');
            if (btnSubirImagen) {
                btnSubirImagen.disabled = false;
                btnSubirImagen.innerHTML = '<i class="bi bi-upload me-2"></i>Subir Imagen';
            }
            
            UI.showAlert(`Error al subir la imagen: ${error.message}`, 'error');
        }
    },
    
    /**
     * Convierte un archivo a Base64
     * @param {File} file - Archivo a convertir
     * @returns {Promise<string>} Cadena Base64
     */
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    },
    
    /**
     * Muestra una vista previa de la imagen seleccionada
     * @param {Event} event - Evento de cambio del input de archivo
     */
    showImagePreview(event) {
        const previewContainer = document.getElementById('previewContainer');
        const imagenPreview = document.getElementById('imagenPreview');
        const file = event.target.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imagenPreview.src = e.target.result;
                previewContainer.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            imagenPreview.src = '#';
            previewContainer.style.display = 'none';
        }
    }
};

/**
 * Módulo para gestionar los encargados de línea
 * @namespace LineManagerService
 */
const LineManagerService = {
    /**
     * Abre el modal de encargados de línea y carga los líderes
     * @returns {Promise<void>}
     */
    async openLineManagerModal() {
        try {
            const selectPlanta = document.getElementById('selectPlanta');
            const plantaSeleccionada = selectPlanta.value;
            
            if (!plantaSeleccionada) {
                UI.showAlert('Por favor, seleccione una planta.', 'warning');
                return;
            }
            
            const tipoGerente = await PlantService.getManagerType(plantaSeleccionada);
            
            if (!tipoGerente) {
                UI.showAlert('No se pudo obtener el tipo de gerente. Por favor, intente nuevamente más tarde.', 'error');
                return;
            }
    
            
            // Obtener el elemento select
            const selectLider = document.getElementById('selectLider');
            
            // Limpiar el select y agregar la opción por defecto
            selectLider.innerHTML = '<option selected disabled value="">Seleccione un líder...</option>';
            
            // Agregar las opciones de líderes
            tipoGerente.forEach(lider => {
                const option = document.createElement('option');
                option.value = lider.id;
                option.textContent = `${lider.type}`;
                selectLider.appendChild(option);
            });
            
            // Habilitar el select
            selectLider.disabled = false;
        } catch (error) {
            console.error('Error al abrir el modal de encargados:', error);
            UI.showAlert('Error al cargar los líderes. Por favor, intente nuevamente más tarde.', 'error');
        }
    },
    
    /**
     * Guarda un encargado de línea
     * @returns {Promise<void>}
     */
    async saveLineManager() {
        try {
            const reloj = document.getElementById('inputRelojUsuario').value.trim();
            const lider = document.getElementById('selectLider').value;
            
            if (!reloj) {
                UI.showAlert('Por favor, ingrese un número de reloj válido.', 'warning');
                return;
            }
            
            if (!lider || lider === '') {
                UI.showAlert('Por favor, seleccione un líder.', 'warning');
                return;
            }
            
            // Obtener información del empleado antes de guardar
            const empleado = await EmployeeService.getEmployee(reloj);
            
            if (empleado) {
                // Aquí se implementaría la lógica para guardar el encargado
                // Por ejemplo, una llamada a otro endpoint para guardar la relación entre el líder y el empleado
                 // Crear el objeto de solicitud
                // const request = {
                //     plant: selectPlanta.value,
                //     lineId: selectLinea.value,
                 //     imageBase64: base64String.split(',')[1], // Eliminar el prefijo "data:image/jpeg;base64,"
                //     registerUser: userDomain && userDomain.userName ? userDomain.userName : 'usuario_desconocido'
                // };



                const request = {
                    employee: reloj,
                    type: lider,
                    plant: AppState.selectedPlant,
                    lineId: AppState.selectedLine,
                    registerUser: AppState.currentUser.userName
                };

                console.log('Solicitud de guardado:', request);

                const result = await API.post('/Home/PostManagerLine', request);

                console.log('Respuesta del servidor:', result);

                if (result.result !== "SUCCESS") {
                    throw new Error(result.error);
                }
            
                // Enviar la solicitud al servidor
                //const result = await API.post('/Home/PostImageCar', request);

                // Simulación de guardado exitoso
                UI.showAlert('Encargado guardado correctamente.', 'success');
                
                // Cerrar el modal y limpiar el formulario
                UI.closeModal('modalEncargados');
                UI.resetForm('formAgregarEncargado');
            }
        } catch (error) {
            console.error('Error al guardar encargado:', error);
            UI.showAlert(`Error al guardar encargado: ${error.message}`, 'error');
        }
    }
};

/**
 * Inicializa la aplicación cuando el DOM está cargado
 */
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Inicializar el usuario actual
        await UserService.getCurrentUser();
        
        // Inicializar selectores de planta y línea
        await initPlantAndLineSelectors();
        
        // Inicializar eventos de la interfaz de usuario
        initUIEvents();
    } catch (error) {
        console.error('Error al inicializar la aplicación:', error);
        UI.showAlert('Error al inicializar la aplicación. Por favor, recargue la página.', 'error');
    }
});

/**
 * Inicializa los selectores de planta y línea
 * @returns {Promise<void>}
 */
async function initPlantAndLineSelectors() {
    try {
        const selectPlanta = document.getElementById('selectPlanta');
        const selectLinea = document.getElementById('selectLinea');
        
        if (!selectPlanta || !selectLinea) return;
        
        // Obtener plantas
        const plantas = await PlantService.getPlants();
        
        // Limpiar opciones existentes
        selectPlanta.innerHTML = '<option selected disabled value="">Seleccione una planta...</option>';
        
        // Agregar nuevas opciones
        plantas.forEach(planta => {
            const option = document.createElement('option');
            option.value = planta.id;
            option.textContent = planta.nombre;
            option.dataset.codigoTress = planta.codigoTress;
            option.dataset.checadores = planta.checadoresDePlanta;
            selectPlanta.appendChild(option);
        });
        
        console.log('Plantas cargadas:', plantas);
        
        // Agregar evento de cambio al select de plantas
        selectPlanta.addEventListener('change', async function() {
            const plantaId = this.value;
            AppState.selectedPlant = plantaId;
            
            if (!plantaId) return;
            
            try {
                // Mostrar indicador de carga
                UI.updateElement('selectLinea', {
                    disabled: true,
                    html: '<option selected disabled value="">Cargando líneas...</option>'
                });
                
                // Obtener líneas para la planta seleccionada
                const lineas = await PlantService.getLines(plantaId);
                
                // Limpiar y agregar nuevas opciones
                selectLinea.innerHTML = '<option selected disabled value="">Seleccione una línea...</option>';
                
                lineas.forEach(linea => {
                    const option = document.createElement('option');
                    option.value = linea.lineId;
                    option.textContent = linea.nombreLinea;
                    option.dataset.workProccess = linea.workProccess;
                    option.dataset.tressId = linea.tressId;
                    option.dataset.terminalEmpaque = linea.terminalEmpaque;
                    option.dataset.formacionPe = linea.formacionPe;
                    option.dataset.metaIPD = linea.metaIPD;
                    selectLinea.appendChild(option);
                });
                
                console.log('Líneas cargadas:', lineas);
                
                // Habilitar el select de líneas
                UI.updateElement('selectLinea', { disabled: false });
            } catch (error) {
                console.error('Error al cargar líneas:', error);
                UI.updateElement('selectLinea', {
                    disabled: false,
                    html: '<option selected disabled value="">Error al cargar líneas</option>'
                });
                UI.showAlert('No se pudieron cargar las líneas. Por favor, intente nuevamente más tarde.', 'error');
            }
        });
        
        // Agregar evento de cambio al select de líneas
        selectLinea.addEventListener('change', function() {
            AppState.selectedLine = this.value;
        });
    } catch (error) {
        console.error('Error al inicializar selectores:', error);
        UI.showAlert('Error al cargar datos iniciales. Por favor, recargue la página.', 'error');
    }
}

/**
 * Inicializa los eventos de la interfaz de usuario
 */
function initUIEvents() {
    // Evento para la vista previa de la imagen
    const inputImagenCarro = document.getElementById('inputImagenCarro');
    if (inputImagenCarro) {
        inputImagenCarro.addEventListener('change', ImageService.showImagePreview);
    }
    
    // Evento para el botón de consultar
    const btnConsultar = document.getElementById('btnConsultar');
    if (btnConsultar) {
        btnConsultar.addEventListener('click', async function() {
            try {
                const selectPlanta = document.getElementById('selectPlanta');
                const selectLinea = document.getElementById('selectLinea');
                
                // Validar que se haya seleccionado una planta y una línea
                if (!selectPlanta.value) {
                    UI.showAlert('Por favor, seleccione una planta.', 'warning');
                    return;
                }
                
                if (!selectLinea.value) {
                    UI.showAlert('Por favor, seleccione una línea.', 'warning');
                    return;
                }
                
                // Mostrar indicador de carga
                UI.updateElement('btnConsultar', {
                    disabled: true,
                    html: '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Consultando...'
                });
                
                // Obtener los datos del monitor de ensamblaje
                const plant = selectPlanta.value;
                const lineIdCMS = selectLinea.value;
                
                const assemblyMonitor = await AssemblyMonitorService.getAssemblyMonitor(plant, lineIdCMS);
                
                // Actualizar la interfaz con los datos obtenidos
                if (assemblyMonitor) {
                    AssemblyMonitorService.updateMonitorUI(assemblyMonitor);
                    
                    // Mostrar mensaje de éxito
                    UI.showAlert(`Información de la línea ${assemblyMonitor.nombreLinea} cargada correctamente.`, 'success');
                } else {
                    UI.showAlert('No se pudo obtener la información de la línea. Por favor, intente nuevamente más tarde.', 'error');
                }
            } catch (error) {
                console.error('Error al consultar información:', error);
                UI.showAlert(`Error al consultar información: ${error.message}`, 'error');
            } finally {
                // Restaurar el botón
                UI.updateElement('btnConsultar', {
                    disabled: false,
                    html: '<i class="bi bi-search me-2"></i>Consultar Información'
                });
            }
        });
    }
    
    // Evento para el botón de encargados de línea
    const btnEncargadosLinea = document.getElementById('btnEncargadosLinea');
    if (btnEncargadosLinea) {
        btnEncargadosLinea.addEventListener('click', LineManagerService.openLineManagerModal);
    }
    
    // Evento para el botón de subir imagen
    const btnSubirImagen = document.getElementById('btnSubirImagen');
    if (btnSubirImagen) {
        btnSubirImagen.addEventListener('click', ImageService.uploadCarImage.bind(ImageService));
    }
    
    // Evento para el campo de reloj de usuario
    const inputRelojUsuario = document.getElementById('inputRelojUsuario');
    if (inputRelojUsuario) {
        // Prevenir el envío del formulario al presionar Enter
        const formAgregarEncargado = document.getElementById('formAgregarEncargado');
        if (formAgregarEncargado) {
            formAgregarEncargado.addEventListener('submit', function(event) {
                event.preventDefault();
                return false;
            });
        }
        
        // Evento de tecla para buscar empleado al presionar Enter
        inputRelojUsuario.addEventListener('keydown', async function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                event.stopPropagation();
                
                const reloj = this.value.trim();
                const empleado = await EmployeeService.getEmployee(reloj);
                if(empleado){
                    const dataResponse = await fetch("Empleado/GetEmployeeImage?plant=" + AppState.selectedPlant + "&employee=" + reloj);
                    const data = await dataResponse.json();
                    console.log(data);
                    
                }
                return false;
            }
        });
    }
    
    // Evento para el botón de guardar encargado
    const btnGuardarEncargado = document.getElementById('btnGuardarEncargado');
    if (btnGuardarEncargado) {
        btnGuardarEncargado.addEventListener('click', LineManagerService.saveLineManager);
    }
}

/**
 * Módulo para gestionar el monitor de ensamblaje
 * @namespace AssemblyMonitorService
 */
const AssemblyMonitorService = {
    /**
     * Obtiene la información del monitor de ensamblaje
     * @param {string} plant - ID de la planta
     * @param {string} lineIdCMS - ID de la línea
     * @returns {Promise<Object|null>} Información del monitor
     */
    async getAssemblyMonitor(plant, lineIdCMS) {
        try {
            if (!plant) {
                UI.showAlert('Por favor, seleccione una planta.', 'warning');
                return null;
            }
            
            if (!lineIdCMS) {
                UI.showAlert('Por favor, seleccione una línea.', 'warning');
                return null;
            }
            
            return await API.get('/api/assemblymonitor/GetAssemblyMonitor', {
                plant: plant,
                lineIdCMS: lineIdCMS
            });
        } catch (error) {
            console.error('Error al obtener información del monitor:', error);
            UI.showAlert('No se pudo obtener la información del monitor. Por favor, intente nuevamente más tarde.', 'error');
            return null;
        }
    },
    
    /**
     * Actualiza la interfaz con la información del monitor
     * @param {Object} data - Datos del monitor
     */
    updateMonitorUI(data) {
        if (!data) return;
        
        // Actualizar campos básicos
        UI.updateElement('inputModeloArnes', { value: data.noParte || 'No disponible' });
        UI.updateElement('inputProduccionEsperada', { value: data.planPiezas || '0' });
        UI.updateElement('inputProduccionActual', { value: data.piezasReal || '0' });
        UI.updateElement('inputEficiencia', { value: data.productividadReal || '0%' });
        
        // Crear campos adicionales si no existen
        this.createAdditionalFields();
        
        // Actualizar campos adicionales
        UI.updateElement('inputNombreLinea', { value: data.nombreLinea || 'No disponible' });
        UI.updateElement('inputFecha', { value: data.fecha || 'No disponible' });
        UI.updateElement('inputHC', { value: data.hc || '0' });
        UI.updateElement('inputAsistencia', { value: data.assittencia || '0' });
        UI.updateElement('inputLF', { value: data.lf || '0' });
        UI.updateElement('inputTurno', { value: data.turno || 'No disponible' });
        UI.updateElement('inputMetaPiezasHr', { value: data.metaPiezasHr || '0' });
        UI.updateElement('inputDiffPiezas', { value: data.diffPiezas || '0' });
        UI.updateElement('inputProductividadMeta', { value: data.productividadMeta || '0%' });
        UI.updateElement('inputDiffProductividad', { value: data.diffProductividad || '0%' });
        UI.updateElement('inputDefectoDia', { value: data.defectoDia || '0' });
        UI.updateElement('inputDiasSinDefecto', { value: data.diasSinDefecto || '0' });
        UI.updateElement('inputTMuerto', { value: data.tMuerto || '0' });
        UI.updateElement('inputHora', { value: data.hora || 'No disponible' });
        UI.updateElement('inputTTplan', { value: data.tTplan || '0' });
        UI.updateElement('inputTTreal', { value: data.tTreal || '0' });
        
        // Habilitar el botón de guardar
        UI.updateElement('btnGuardarInformacion', { disabled: false });
    },
    
    /**
     * Crea campos adicionales en el formulario si no existen
     */
    createAdditionalFields() {
        const formContainer = document.querySelector('#formInformacionLinea .row');
        if (!formContainer) return;
        
        // Verificar si ya existen los campos adicionales
        if (document.getElementById('inputNombreLinea')) return;
        
        // Crear campos adicionales
        const additionalFields = [
            { id: 'inputNombreLinea', label: 'Nombre de Línea', placeholder: 'Ej: Línea A' },
            { id: 'inputFecha', label: 'Fecha', placeholder: 'Ej: 01/01/2023' },
            { id: 'inputHC', label: 'HC', placeholder: 'Ej: 10' },
            { id: 'inputAsistencia', label: 'Asistencia', placeholder: 'Ej: 8' },
            { id: 'inputLF', label: 'LF', placeholder: 'Ej: 2' },
            { id: 'inputTurno', label: 'Turno', placeholder: 'Ej: Matutino' },
            { id: 'inputMetaPiezasHr', label: 'Meta Piezas/Hr', placeholder: 'Ej: 50' },
            { id: 'inputDiffPiezas', label: 'Diferencia Piezas', placeholder: 'Ej: +10' },
            { id: 'inputProductividadMeta', label: 'Productividad Meta', placeholder: 'Ej: 80%' },
            { id: 'inputDiffProductividad', label: 'Diferencia Productividad', placeholder: 'Ej: +5%' },
            { id: 'inputDefectoDia', label: 'Defectos del Día', placeholder: 'Ej: 2' },
            { id: 'inputDiasSinDefecto', label: 'Días Sin Defecto', placeholder: 'Ej: 5' },
            { id: 'inputTMuerto', label: 'Tiempo Muerto', placeholder: 'Ej: 30 min' },
            { id: 'inputHora', label: 'Hora', placeholder: 'Ej: 14:30' },
            { id: 'inputTTplan', label: 'TT Plan', placeholder: 'Ej: 120' },
            { id: 'inputTTreal', label: 'TT Real', placeholder: 'Ej: 115' }
        ];
        
        // Agregar campos al formulario
        additionalFields.forEach(field => {
            const fieldHtml = `
                <div class="col-md-6 mt-3">
                    <label for="${field.id}" class="form-label">${field.label}</label>
                    <input type="text" class="form-control" id="${field.id}" placeholder="${field.placeholder}" readonly>
                </div>
            `;
            formContainer.insertAdjacentHTML('beforeend', fieldHtml);
        });

        formContainer.insertAdjacentHTML('beforeend', `
            <div class="col-12 text-end">
                                <button type="submit" class="btn btn-success" id="btnGuardarInformacion" disabled><i
                                        class="bi bi-save me-2"></i>Guardar Cambios</button>
                            </div>`);
    }
};

