import { AppState,API,UI } from "./utilidades.js";
/**
 * Módulo para gestionar la información del usuario
 * @namespace UserService
 */
export const UserService = {
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
export const PlantService = {
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
export const EmployeeService = {
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
export const ImageService = {
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
export const LineManagerService = {
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
                       
            const lider = document.getElementById('selectLider').options[document.getElementById('selectLider').selectedIndex].text.trim();
            
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
 * Módulo para gestionar el monitor de ensamblaje
 * @namespace AssemblyMonitorService
 */
export const AssemblyMonitorService = {
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

        console.log("laol "+AppState.department);
        
        // Verificar si el usuario pertenece al departamento de ingeniería
        const esIngenieria = AppState.department === "Ingenieria";
        const esRh = AppState.department === "Rh";
        const esManufactura = AppState.department === "Manufactura";
        
        // Actualizar campos básicos
        UI.updateElement('inputModeloArnes', { 
            value: data.numeroParte || 'No disponible',
            readonly: !esIngenieria // Habilitar solo si es de ingeniería
        });
        UI.updateElement('inputProduccionEsperada', { 
            value: data.metaProductividad || '0',
            readonly: !esIngenieria // Habilitar solo si es de ingeniería
        });
        UI.updateElement('inputProduccionActual', { value: data.metaIPD || '0' });
        
        // Crear campos adicionales si no existen
        this.createAdditionalFields();
        
        // Actualizar campos adicionales
        UI.updateElement('inputNombreLinea', 
            { 
                value: data.nombreLinea || 'No disponible' ,
                readonly:!esManufactura
            }
        );
        UI.updateElement('inputWorkProcess', { value: data.workProccess || 'No disponible' });
        UI.updateElement('inputTressId', { 
            value: data.tressId || 'No disponible',
            readonly:!esRh
         });
        UI.updateElement('inputTerminalEmpaque', { value: data.terminalEmpaque || 'No disponible' });
        UI.updateElement('inputFormacionPe', { 
            value: data.formacionPe || 'No disponible',
            readonly: !esIngenieria // Habilitar solo si es de ingeniería
        });
        UI.updateElement('inputLineId', { value: data.lineId || 'No disponible' });
        UI.updateElement('inputLineId2', { value: data.lineId2 || 'No disponible' });
        UI.updateElement('inputDescripcion', { value: data.descripcion || 'No disponible' });
        UI.updateElement('inputCustomer', { value: data.customer || 'No disponible' });
        UI.updateElement('inputProject', { value: data.project || 'No disponible' });
        UI.updateElement('inputComunizada', { value: data.comunizada || 'No disponible' });
        UI.updateElement('inputEstatus', { value: data.estatus ? 'Activo' : 'Inactivo' });
        UI.updateElement('inputTipoConfiguracion', { value: data.idTipoConfiguracion || '0' });
        
        // Habilitar el botón de guardar solo si el usuario es de ingeniería
        UI.updateElement('btnGuardarInformacion', { disabled: !esIngenieria });
    },
    
    /**
     * Crea campos adicionales en el formulario si no existen
     */
    createAdditionalFields() {
        // Lista de campos adicionales que deben existir
        const additionalFields = [
            'inputNombreLinea', 'inputWorkProcess', 'inputTressId', 'inputTerminalEmpaque',
            'inputFormacionPe', 'inputLineId', 'inputLineId2', 'inputDescripcion',
            'inputCustomer', 'inputProject', 'inputComunizada', 'inputEstatus', 'inputTipoConfiguracion'
        ];
        
        // Verificar si cada campo existe, si no, crearlo dinámicamente
        additionalFields.forEach(fieldId => {
            if (!document.getElementById(fieldId)) {
                console.log(`Creando campo adicional: ${fieldId}`);
                // Aquí se podría implementar la lógica para crear el campo dinámicamente si es necesario
            }
        });

        // Verificar si el botón ya existe
        if (document.getElementById('btnGuardarInformacion')) return;
        
        const formContainer = document.querySelector('#formInformacionLinea .row');
        if (!formContainer) return;
        formContainer.insertAdjacentHTML('beforeend', `
            <div class="col-12 text-end">
                                <button type="submit" class="btn btn-success" id="btnGuardarInformacion" disabled><i
                                        class="bi bi-save me-2"></i>Guardar Cambios</button>
                            </div>`);
    }
};