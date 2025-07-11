import { API,UI ,AppState } from "./utilidades.js";
import { PlantService,UserService,EmployeeService,ImageService,LineManagerService,AssemblyMonitorService } from "./services.js";


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

        // Inicializar funcionalidad de drag and drop
        initDragAndDrop();

       UI.makeModalDraggable('modalEncargados');
       UI.makeModalDraggable("modalCargarImagen")
       
    } catch (error) {
        console.log(error)
        UI.showAlert('Error al inicializar la aplicación. Por favor, recargue la página.', 'error');
    }
});


/**
 * Inicializa los eventos de la interfaz de usuario
 */
function initUIEvents() {
    // Evento para la vista previa de la imagen
    const inputImagenCarro = document.getElementById('inputImagenCarro');
    if (inputImagenCarro) {
        inputImagenCarro.addEventListener('change', ImageService.showImagePreview);
    }

    // Eventos para cargar imagen  del Mayla
    initMailaImageEvents();
    
    // Eventos para cargar investigación
    initInvestigacionEvents();
    
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

               
    
    
                const userRol = await API.get('/Empleado/GetUser',
                    {
                        plant:AppState.selectedPlant,
                        user_id:AppState.currentUser.userName
                    });
                
              

                AppState.department = userRol.department;

                document.querySelector("#containerDep").classList.remove("d-none");
                if(userRol.department){
                    document.getElementById('inputDepartamentoUsuario').innerHTML = '<i class="bi bi-building"></i> DEPARTAMENTO: ' + userRol.department.toUpperCase() || 'No asignado';
              
                }else{
                    document.getElementById('inputDepartamentoUsuario').innerHTML = '<i class="bi bi-building"></i> DEPARTAMENTO: No asignado';
                }
  
                //const assemblyMonitor = await AssemblyMonitorService.getAssemblyMonitor(plant, lineIdCMS);

                let assemblyMonitor = null;

                    try {
                        assemblyMonitor = await API.get('/Monitor/GetLineDetail',
                            {
                                line_id:AppState.selectedLine,
                                plant:AppState.selectedPlant,
                            });

                            
                    } catch (error) {
                        
                    }
                   

               

                

        
                
                // Actualizar la interfaz con los datos obtenidos
                if (assemblyMonitor) {
                    AssemblyMonitorService.updateMonitorUI(assemblyMonitor);

                    document.querySelector("#cardInformacionLinea").classList.remove("d-none")
                    document.querySelector("#CardSectionAccionesAdicionales").classList.remove("d-none")
                    document.querySelector("#CardSectionCargarInvestigacion").classList.remove("d-none") 
                    

                    const department = AppState.department;

                    // Define las configuraciones de UI por departamento
                    const departmentConfigs = {
                        "Ingenieria": {
                            btnAgregarEncargados: { addClass: "d-none" },
                            btnCargarImagen: { removeClass: "d-none" }
                            
                        },
                        "Manufactura": {
                            btnCargarImagen: { addClass: "d-none" },
                            btnAgregarEncargados: { removeClass: "d-none" }
                        },
                        "RH": {
                            CardSectionAccionesAdicionales: { addClass: "d-none" }
                        },
                        "default": {
                            btnAgregarEncargados: { addClass: "d-none" },
                            btnCargarImagen: { addClass: "d-none" }
                        }
                    };

                    // Obtiene la configuración para el departamento actual o la configuración por defecto
                    const currentConfig = departmentConfigs[department] || departmentConfigs["default"];

                    // Aplica las actualizaciones de UI basadas en la configuración
                    for (const elementId in currentConfig) {
                        UI.updateElement(elementId, currentConfig[elementId]);
                    }

                    // Manejo específico del evento para el botón de encargados de línea en Manufactura
                    if (department === "Manufactura") {
                        const btnEncargadosLinea = document.getElementById('btnAgregarEncargados');
                        if (btnEncargadosLinea) {
                            // Se recomienda añadir el event listener una sola vez si la lógica lo permite
                            // Para este caso, asumo que se puede añadir cada vez que se consulta la información
                            btnEncargadosLinea.addEventListener('click', LineManagerService.openLineManagerModal);
                        }
                    }
                    
                    // Mostrar mensaje de éxito
                    // UI.showAlert(`Información de la línea ${assemblyMonitor.nombreLinea} cargada correctamente.`, 'success');
                } else {
                    UI.showAlert('No se pudo obtener la información de la línea. Por favor, intente nuevamente más tarde.', 'error');
                }
            } catch (error) {
               
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
                  
                    
                    // Mostrar la imagen del empleado si está disponible
                    if(data && data.image) {
                        const imgElement = document.getElementById('empleadoImage');
                        const placeholderElement = document.getElementById('empleadoImagePlaceholder');
                        
                        imgElement.src = "data:image/jpeg;base64," + data.image;
                        imgElement.classList.remove('d-none');
                        placeholderElement.classList.add('d-none');
                        
                        // Mostrar información del empleado
                        const infoElement = document.getElementById('empleadoInfo');
                        const nombreElement = document.getElementById('empleadoNombre');
                        
                        nombreElement.textContent = data.employee || 'Empleado encontrado';
                        infoElement.classList.remove('d-none');
                    }
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

    // Evento para el formulario de información de línea
    const formInformacionLinea = document.getElementById('formInformacionLinea');
    if (formInformacionLinea) {
        formInformacionLinea.addEventListener('submit', async function(e) {
            e.preventDefault();
        
            const formData = new FormData(this);
            const data = {};
            formData.forEach((value, key) => {
        
                // Convertir Estatus de string a boolean
                if (key === 'estatus') {
                    data[key] = value === 'Activo' || value === 'true';
                }
                // Convertir IdTipoConfiguracion de string a int
                else if (key === 'idTipoConfiguracion') {
                    data[key] = parseInt(value, 10) || 0; // Si no se puede convertir, usar 0 como valor predeterminado
                }
                // Para los demás campos, mantener el valor original
                else {
                    if(value == "No disponible"){
                        data[key] = "";
                    }else{
                        data[key] = value;
                    }
                    
                }
            });

          

            

            if(AppState.customers){
                let customerText = null;
                AppState.customers.forEach(customer => {
                    if(customer.id == data.customer){
                        customerText = customer.customer;
                    }
                });
    
                data.customer = customerText;
            }
            
        
            try{

                UI.updateElement('btnGuardarInformacion',{
                    disabled: true,
                    html: '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Guardando...'
                })

                 data.plantId = AppState.selectedPlant;

                // console.log(data)

                const response = await API.post('/Line/UpdateLine', data);

                
                
             
        
                if(response.result == "UPDATE_OK"){
                  UI.showAlert(response.msj,'success');
                }else{
                    UI.showAlert(response.msj,'error');
                }
        
            }catch(error) {
                UI.showAlert('Error al guardar la información','error');
            } finally {


                UI.updateElement('btnGuardarInformacion',{
                    disabled: false,
                    html: '<i class="bi bi-save"></i> Guardar cambios'
                })
            }


        
            
        
            
        });
    }

    // Evento para el botón de buscar empleado
    const btnBuscarEmpleado = document.getElementById('btnBuscarEmpleado');
    if (btnBuscarEmpleado) {
        btnBuscarEmpleado.addEventListener('click', async function() {
            const reloj = document.getElementById('inputRelojUsuario').value.trim();
            
            if(!reloj) {
                // Mostrar mensaje de error si el campo está vacío
                UI.showAlert('Por favor, ingrese un número de reloj válido','warning')
                return;
            }
            
            try {
                // Mostrar indicador de carga
                this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                this.disabled = true;
                
               const empleado = await EmployeeService.getEmployee(reloj);

               const data = await EmployeeService.getEmployeeImage(reloj);
             
                if(empleado) {
                    
                    // Verificar si el empleado ya es líder
                    const lideresExistentes = await LineManagerService.getLineManager()
                    // Verificar si el empleado ya es líder
                    const isLider = lideresExistentes.some(lider => lider.employee === empleado.reloj);

                    if(isLider) {
                        // Mostrar confirmación con SweetAlert2
                        const liderInfo = lideresExistentes.find(lider => lider.employee === empleado.reloj);
                        Swal.fire({
                            title: 'Empleado ya asignado',
                            html: `
                                <div class="text-center mb-3">
                                    <img src="${data && data.image ? "data:image/jpeg;base64," + data.image : 'assets/img/user-placeholder.png'}" 
                                         class="rounded-circle img-thumbnail mb-3" 
                                         style="width: 120px; height: 120px; object-fit: cover;">
                                    <h5 class="mb-2">${empleado.nombre || 'Empleado'}</h5>
                                    <p>Este empleado ya está asignado como líder de línea con el rol: <strong>${liderInfo ? liderInfo.type : 'Líder'}</strong></p>
                                    <p>¿Qué acción desea realizar?</p>
                                </div>
                            `,
                            icon: 'warning',
                            showDenyButton: true,
                            showCancelButton: true,
                            confirmButtonColor: '#d33',
                            denyButtonColor: '#3085d6',
                            cancelButtonColor: '#6c757d',
                            confirmButtonText: 'Eliminar líder',
                            denyButtonText: 'Continuar proceso',
                            cancelButtonText: 'Cancelar'
                        }).then(async (result) => {
                            if (result.isConfirmed) {
                                // Aquí implementar la lógica para eliminar el líder
                                //eliminarLider(empleado.id);
                                const result = await LineManagerService.deleteLineManager(empleado.reloj);
                                if(result.result == "SUCCESS"){
                                    UI.showAlert('Líder eliminado correctamente','success');
                                    return;
                                }
                                UI.showAlert('Error al eliminar líder','error');
                                return;
                            } else if (result.isDenied) {
                                // Continuar con el proceso de asignación
                                // Aquí puedes implementar la lógica para continuar con el proceso
                                // Por ejemplo, mostrar el formulario para asignar un nuevo rol
                                // continuarProcesoAsignacion(empleado);
                                cargarImagenLider(data,empleado);
                               return;
                            } else {
                                // Cancelar la acción
                                return;
                            }
                        });
                        
                    }


                    cargarImagenLider(data,empleado);


                    
                    
                    
                } else {
                    // Mostrar mensaje de error si no se encuentra el empleado
                    const infoElement = document.getElementById('empleadoInfo');
                    const nombreElement = document.getElementById('empleadoNombre');
                    
                    nombreElement.textContent = 'Empleado no encontrado';
                    infoElement.classList.remove('d-none');
                    infoElement.classList.remove('alert-info');
                    infoElement.classList.add('alert-danger');
                    
                    // Restablecer la imagen al placeholder
                    const imgElement = document.getElementById('empleadoImage');
                    const placeholderElement = document.getElementById('empleadoImagePlaceholder');
                    
                    imgElement.classList.add('d-none');
                    placeholderElement.classList.remove('d-none');
                }
            } catch (error) {
               
                
                // Mostrar mensaje de error
                const infoElement = document.getElementById('empleadoInfo');
                const nombreElement = document.getElementById('empleadoNombre');
                
                nombreElement.textContent = 'Error al buscar empleado';
                infoElement.classList.remove('d-none');
                infoElement.classList.remove('alert-info');
                infoElement.classList.add('alert-danger');
            } finally {
                // Restaurar el botón
                this.innerHTML = '<i class="bi bi-search"></i>';
                this.disabled = false;
            }
        });
    }

    // EVENTO PARA EVENTO CARGA IMAGEN CARRO
    const btnCargarImagen = document.getElementById('btnCargarImagen');
    if (btnCargarImagen) {
        btnCargarImagen.addEventListener('click',() =>{
            ImageService.openImageModal();
        });
    }
}

/**
 * Inicializa los eventos relacionados con la carga de investigación
 */
function initInvestigacionEvents() {
    const inputArchivoInvestigacion = document.getElementById('inputArchivoInvestigacion');
    const dropAreaInvestigacion = document.getElementById('dropAreaInvestigacion');
    const btnSubirInvestigacion = document.getElementById('btnSubirInvestigacion');
    const btnRemoveFileInvestigacion = document.getElementById('btnRemoveFileInvestigacion');
    
    if (inputArchivoInvestigacion) {
        inputArchivoInvestigacion.addEventListener('change', handleInvestigacionFileSelect);
    }
    
    if (dropAreaInvestigacion) {
        // Eventos de drag and drop
        dropAreaInvestigacion.addEventListener('dragover', window.handleDragOver);
        dropAreaInvestigacion.addEventListener('dragleave', window.handleDragLeave);
        dropAreaInvestigacion.addEventListener('drop', handleInvestigacionFileDrop);
    }
    
    if (btnSubirInvestigacion) {
        btnSubirInvestigacion.addEventListener('click', uploadInvestigacion);
    }
    
    if (btnRemoveFileInvestigacion) {
        btnRemoveFileInvestigacion.addEventListener('click', removeInvestigacionFile);
    }
}

/**
 * Maneja la selección de archivo de investigación
 */
function handleInvestigacionFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndShowInvestigacionFile(file);
    }
}

/**
 * Maneja el drop de archivo de investigación
 */
function handleInvestigacionFileDrop(event) {
    event.preventDefault();
    const dropArea = document.getElementById('dropAreaInvestigacion');
    dropArea.style.borderColor = '#17a2b8';
    dropArea.style.backgroundColor = '';
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        document.getElementById('inputArchivoInvestigacion').files = files;
        validateAndShowInvestigacionFile(file);
    }
}

/**
 * Valida y muestra la información del archivo de investigación
 */
function validateAndShowInvestigacionFile(file) {
    // Validar tipo de archivo
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/bmp',
        'image/tiff'
    ];
    
    if (!allowedTypes.includes(file.type)) {
        UI.showAlert('Tipo de archivo no permitido. Por favor, seleccione un archivo válido.', 'error');
        return;
    }
    
    // Validate file size (2MB maximum)
    const maxSize = 2 * 1024 * 1024; // 2MB in bytes
    if (file.size > maxSize) {
        UI.showAlert('El archivo es demasiado grande. El tamaño máximo permitido es 2MB.', 'error');
        return;
    }
    
    // Mostrar información del archivo
    showInvestigacionFilePreview(file);
}

/**
 * Muestra la vista previa del archivo de investigación
 */
function showInvestigacionFilePreview(file) {
    const previewContainer = document.getElementById('previewContainerInvestigacion');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const fileSizeDisplay = document.getElementById('fileSizeDisplay');
    const btnSubirInvestigacion = document.getElementById('btnSubirInvestigacion');
    
    if (fileNameDisplay) {
        fileNameDisplay.textContent = file.name;
    }
    
    if (fileSizeDisplay) {
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        fileSizeDisplay.textContent = `Tamaño: ${sizeInMB} MB`;
    }
    
    if (previewContainer) {
        previewContainer.style.display = 'block';
    }
    
    if (btnSubirInvestigacion) {
        btnSubirInvestigacion.disabled = false;
    }
}

/**
 * Remueve el archivo de investigación seleccionado
 */
function removeInvestigacionFile() {
    const inputArchivoInvestigacion = document.getElementById('inputArchivoInvestigacion');
    const previewContainer = document.getElementById('previewContainerInvestigacion');
    const btnSubirInvestigacion = document.getElementById('btnSubirInvestigacion');
    
    if (inputArchivoInvestigacion) {
        inputArchivoInvestigacion.value = '';
    }
    
    if (previewContainer) {
        previewContainer.style.display = 'none';
    }
    
    if (btnSubirInvestigacion) {
        btnSubirInvestigacion.disabled = true;
    }
}

/**
 * Sube el archivo de investigación
 */
async function uploadInvestigacion() {
    try {
      
      
        const fileInput = document.getElementById('inputArchivoInvestigacion');
        const file = fileInput.files[0];
        
        
        
        if (!file) {
            UI.showAlert('Por favor, seleccione un archivo para subir.', 'warning');
            return;
        }
        
        if (!AppState.selectedPlant || !AppState.selectedLine) {
            UI.showAlert('Por favor, seleccione una planta y línea antes de subir la investigación.', 'warning');
            return;
        }
        
        // Mostrar indicador de carga
        const btnSubirInvestigacion = document.getElementById('btnSubirInvestigacion');
        const originalText = btnSubirInvestigacion.innerHTML;
        btnSubirInvestigacion.disabled = true;
        btnSubirInvestigacion.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subiendo...';
        
        // Convertir archivo a Base64
        const imageBase64 = await convertFileToBase64(file);
        
        // Preparar el cuerpo de la petición JSON
        const requestBody = {
            plant: AppState.selectedPlant,
            imageBase64: imageBase64,
            registerUser: AppState.currentUser.userName
        };
        
        // Realizar la petición al nuevo endpoint
        const response = await fetch('/api/assemblymonitor/PostImageQaInvestigation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody)
        });
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status} ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.result) {
            UI.showAlert(result.msj || 'Investigación subida exitosamente.', 'success');
            
            // Limpiar el formulario
            document.getElementById('formCargarInvestigacion').reset();
            removeInvestigacionFile();
            
            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalCargarInvestigacion'));
            if (modal) {
                modal.hide();
            }
        } else {
            UI.showAlert(result.msj || 'Error al subir la investigación.', 'error');
        }
        
    } catch (error) {
        console.error('Error al subir investigación:', error);
        UI.showAlert('Error al subir la investigación. Por favor, intente nuevamente.', 'error');
    } finally {
        // Restaurar el botón
        const btnSubirInvestigacion = document.getElementById('btnSubirInvestigacion');
        btnSubirInvestigacion.disabled = false;
        btnSubirInvestigacion.innerHTML = '<i class="bi bi-upload me-2"></i>Subir Investigación';
    }
}


function cargarImagenLider(data , empleado){
    // Mostrar la imagen del empleado si está disponible
    if(data && data.image) {
        const imgElement = document.getElementById('empleadoImage');
        const placeholderElement = document.getElementById('empleadoImagePlaceholder');
        
        imgElement.src = "data:image/jpeg;base64," + data.image;
        imgElement.classList.remove('d-none');
        placeholderElement.classList.add('d-none');
        
        // Mostrar información del empleado
        const infoElement = document.getElementById('empleadoInfo');
        const nombreElement = document.getElementById('empleadoNombre');
        
        nombreElement.textContent = empleado.nombre || 'Empleado encontrado';
        infoElement.classList.remove('d-none');
        infoElement.classList.remove('alert-danger');
        infoElement.classList.add('alert-info');
    }
}

/**
 * Inicializa la funcionalidad de arrastrar y soltar para imágenes
 */
function initDragAndDrop() {
    const dropArea = document.getElementById('dropArea');
    const inputFile = document.getElementById('inputImagenCarro');
    const previewContainer = document.getElementById('previewContainer');
    const imagenPreview = document.getElementById('imagenPreview');
    const btnRemoveImage = document.getElementById('btnRemoveImage');
    const imageInfo = document.getElementById('imageInfo');
    const btnSubirImagen = document.getElementById('btnSubirImagen');
    
    // Si alguno de los elementos no existe, salir de la función
    if (!dropArea || !inputFile || !previewContainer || !imagenPreview) {
       
        return;
    }
    
    // Prevenir comportamiento por defecto de arrastrar y soltar
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    // Resaltar área cuando se arrastra un archivo sobre ella
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('border-primary');
        dropArea.style.backgroundColor = 'rgba(13, 110, 253, 0.05)';
    }
    
    function unhighlight() {
        dropArea.classList.remove('border-primary');
        dropArea.style.backgroundColor = '';
    }
    
    // Funciones globales para drag and drop de investigación
    window.handleDragOver = function(e) {
        e.preventDefault();
        const dropArea = document.getElementById('dropAreaInvestigacion');
        dropArea.style.borderColor = '#007bff';
        dropArea.style.backgroundColor = 'rgba(0, 123, 255, 0.05)';
    };
    
    window.handleDragLeave = function(e) {
        e.preventDefault();
        const dropArea = document.getElementById('dropAreaInvestigacion');
        dropArea.style.borderColor = '#17a2b8';
        dropArea.style.backgroundColor = '';
    };
    
    // Manejar el evento de soltar archivos
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        
        if (files.length > 0) {
            handleFiles(files);
        }
    }
    
    // Manejar cambios en el input de archivo
    inputFile.addEventListener('change', function() {
        if (this.files.length > 0) {
            handleFiles(this.files);
        }
    });
    
    // Procesar los archivos
    function handleFiles(files) {
        const file = files[0]; // Solo tomamos el primer archivo

        inputFile.files = files; // Asignar los archivos al input de archivo
        
        if (!file.type.startsWith('image/')) {
            alert('Por favor, seleccione un archivo de imagen válido.');
            UI.showAlert({
                message: 'Por favor, seleccione un archivo de imagen válido.',
                type: 'warning'
            })
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            imagenPreview.src = e.target.result;
            previewContainer.style.display = 'block';
            
            // Mostrar información de la imagen
            const fileSize = formatFileSize(file.size);
            imageInfo.textContent = `${file.name} (${fileSize})`;
            
            // Habilitar botón de subir
            btnSubirImagen.disabled = false;

            document.querySelector("#containerFile").classList.add("d-none")
        };
        reader.readAsDataURL(file);
    }
    
    // Formatear tamaño de archivo
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    }
    
    // Eliminar imagen
    if (btnRemoveImage) {
        btnRemoveImage.addEventListener('click', function() {
            previewContainer.style.display = 'none';
            inputFile.value = '';
            btnSubirImagen.disabled = true;
            document.querySelector("#containerFile").classList.remove("d-none")
        });
    }
}


/**
 * Inicializa los selectores de planta y línea
 * @returns {Promise<void>}
 */
async function initPlantAndLineSelectors() {
    try {
        const selectPlanta = document.getElementById('selectPlanta');
        const selectLinea = document.getElementById('selectLinea');
        
        if (!selectPlanta || !selectLinea) return;

        // Mostrar indicador de carga
        UI.updateElement('selectPlanta', {
            disabled: true,
            html: '<option selected disabled value="">Cargando plantas...</option>'
        });
        // Obtener plantas
        const plantas = await PlantService.getPlants();

        UI.updateElement('selectPlanta', {
            disabled: false,
            html: '<option selected disabled value="">Seleccione una planta...</option>'
        })
        
        
        // Agregar nuevas opciones
        plantas.forEach(planta => {
            const option = document.createElement('option');
            option.value = planta.id;
            option.textContent = planta.nombre;
            option.dataset.codigoTress = planta.codigoTress;
            option.dataset.checadores = planta.checadoresDePlanta;
            selectPlanta.appendChild(option);
        });
        
      
        
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
                
               
                
                // Habilitar el select de líneas
                UI.updateElement('selectLinea', { disabled: false });
            } catch (error) {
              
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
        
        UI.showAlert('Error al cargar datos iniciales. Por favor, recargue la página.', 'error');
    }
}


// ? CODIGO PARA CARGAR IMAGENMaylaB
/**
 * Inicializa los eventos para la carga de imagen  del Mayla
 */
function initMailaImageEvents() {
    const inputImagenMaila = document.getElementById('inputImagenMaila');
    const dropAreaMaila = document.getElementById('dropAreaMaila');
    const btnSubirImagenMaila = document.getElementById('btnSubirImagenMaila');
    const btnRemoveImageMaila = document.getElementById('btnRemoveImageMaila');
    
    if (inputImagenMaila) {
        inputImagenMaila.addEventListener('change', handleMailaImageSelect);
    }
    
    if (dropAreaMaila) {
        dropAreaMaila.addEventListener('dragover', window.handleDragOver);
        dropAreaMaila.addEventListener('dragleave', window.handleDragLeave);
        dropAreaMaila.addEventListener('drop', handleMailaImageDrop);
    }
    
    if (btnSubirImagenMaila) {
        btnSubirImagenMaila.addEventListener('click', uploadMailaImage);
    }
    
    if (btnRemoveImageMaila) {
        btnRemoveImageMaila.addEventListener('click', removeMailaImage);
    }
}

/**
 * Maneja la selección de imagen  del Mayla
 */
function handleMailaImageSelect(event) {
    const file = event.target.files[0];
    if (file) {
        validateAndShowMailaImage(file);
    }
}

/**
 * Maneja el drop de imagen  del Mayla
 */
function handleMailaImageDrop(event) {
    event.preventDefault();
    const dropArea = document.getElementById('dropAreaMaila');
    dropArea.style.borderColor = '#ffc107';
    dropArea.style.backgroundColor = '';
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        document.getElementById('inputImagenMaila').files = files;
        validateAndShowMailaImage(file);
    }
}

/**
 * Valida y muestra la imagen  del Mayla
 */
function validateAndShowMailaImage(file) {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
        UI.showAlert('Por favor, seleccione un archivo de imagen válido.', 'error');
        return;
    }
    
    // Validar tamaño (2MB máximo)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        UI.showAlert('La imagen es demasiado grande. El tamaño máximo permitido es 2MB.', 'error');
        return;
    }
    
    showMailaImagePreview(file);
}

/**
 * Muestra la vista previa de la imagen  del Mayla
 */
function showMailaImagePreview(file) {
    const dropArea = document.getElementById('dropAreaMaila');
    const previewContainer = document.getElementById('mailaImagePreview');
    
    // Ocultar el área de drop
    dropArea.style.display = 'none';
    
    // Crear elemento de imagen
    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.className = 'img-fluid rounded';
    img.style.maxHeight = '200px';
    img.style.objectFit = 'contain';
    
    // Crear botón de eliminar
    const removeBtn = document.createElement('button');
    removeBtn.type = 'button';
    removeBtn.className = 'btn btn-outline-danger btn-sm mt-2';
    removeBtn.innerHTML = '<i class="bi bi-trash"></i> Eliminar imagen';
    removeBtn.onclick = removeMailaImage;
    
    // Limpiar y agregar contenido al preview
    previewContainer.innerHTML = '';
    previewContainer.appendChild(img);
    previewContainer.appendChild(removeBtn);
    previewContainer.style.display = 'block';

    document.querySelector("#btnSubirImagenMaila").disabled = false;
}
/**
 * Remueve la imagen  del Mayla seleccionada
 */
function removeMailaImage() {
    const dropArea = document.getElementById('dropAreaMaila');
    const previewContainer = document.getElementById('mailaImagePreview');
    const fileInput = document.getElementById('inputImagenMaila');
    
    // Limpiar el input de archivo
    fileInput.value = '';
    
    // Ocultar preview y mostrar área de drop
    previewContainer.style.display = 'none';
    previewContainer.innerHTML = '';
    dropArea.style.display = 'block';
    
    // Limpiar variable global si existe
    if (window.selectedMailaImage) {
        window.selectedMailaImage = null;
    }

    document.querySelector("#btnSubirImagenMaila").disabled = true;
}

/**
 * Sube la imagen  del Mayla
 */
async function uploadMailaImage() {
    try {
        const fileInput = document.getElementById('inputImagenMaila');
        const file = fileInput.files[0];
        
        if (!file) {
            UI.showAlert('Por favor, seleccione una imagen para subir.', 'warning');
            return;
        }
        
        if (!AppState.selectedPlant || !AppState.selectedLine) {
            UI.showAlert('Por favor, seleccione una planta y línea antes de subir la imagen.', 'warning');
            return;
        }
        
        // Mostrar indicador de carga
        const btnSubir = document.getElementById('btnSubirImagenMaila');
        const originalText = btnSubir.innerHTML;
        btnSubir.disabled = true;
        btnSubir.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subiendo...';
        
        // Convertir imagen a Base64
        const imageBase64 = await convertFileToBase64(file);
        
        // Crear objeto de request
        const requestData = {
            plant: AppState.selectedPlant,
            lineId: AppState.selectedLine,
            imageBase64: imageBase64,
            registerUser: AppState.currentUser.userName || 'Usuario' // Asegúrate de tener el usuario actual
        };
        
        // Realizar petición al nuevo endpoint
        const response = await fetch('/api/assemblymonitor/PostImageMaylar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.result === 'SUCCESS' || result.result === 'OK') {
            UI.showAlert('Imagen  del Mayla subida exitosamente.', 'success');
            
            // Limpiar formulario
            document.getElementById('formCargarImagenMaila').reset();
            removeMailaImage();
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('modalCargarImagenMaila'));
            if (modal) {
                modal.hide();
            }
        } else {
            UI.showAlert(result.msj || 'Error al subir la imagen  del Mayla.', 'error');
        }
        
    } catch (error) {
        console.error('Error al subir imagen  del Mayla:', error);
        UI.showAlert('Error al subir la imagen. Por favor, intente nuevamente.', 'error');
    } finally {
        // Restaurar botón
        const btnSubir = document.getElementById('btnSubirImagenMaila');
        btnSubir.disabled = false;
        btnSubir.innerHTML = '<i class="bi bi-upload me-2"></i>Subir Imagen  del Mayla';
    }
}

// Función auxiliar para convertir archivo a Base64
function convertFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            // Remover el prefijo "data:image/...;base64," si existe
            const base64 = reader.result.split(',')[1] || reader.result;
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Función para obtener la imagen del maylar
async function getLineImageMaylar(plant, lineId) {
    try {
        const response = await fetch(`/api/assemblymonitor/GetLineImageMaylar?plant=${encodeURIComponent(plant)}&line_id=${encodeURIComponent(lineId)}`);
        
        if (!response.ok) {
            throw new Error(`Error en la petición: ${response.status}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error('Error al obtener imagen del maylar:', error);
        throw error;
    }
}

// Función para mostrar la imagen del maylar en el modal
async function loadMailaImageToModal(plant, lineId) {
    try {
        const imageData = await getLineImageMaylar(plant, lineId);
        
        if (imageData && imageData.imageBase64) {
            // Mostrar la imagen actual en el modal
            const imgElement = document.getElementById('imagenMailaActual');
            const containerElement = document.getElementById('imagenMailaContainer');
            
            if (imgElement && containerElement) {
                imgElement.src = `data:image/jpeg;base64,${imageData.imageBase64}`;
                containerElement.style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Error al cargar imagen del maylar:', error);
        // Ocultar el contenedor si hay error
        const containerElement = document.getElementById('imagenMailaContainer');
        if (containerElement) {
            containerElement.style.display = 'none';
        }
    }
}

// Ejemplo de uso cuando se abre el modal
$('#modalCargarImagenMaila').on('show.bs.modal', function() {
    if (AppState.selectedPlant && AppState.selectedLine) {
        loadMailaImageToModal(AppState.selectedPlant, AppState.selectedLine);
    }
});