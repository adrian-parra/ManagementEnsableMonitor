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







