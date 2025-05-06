
        // Script para la vista previa de la imagen (opcional, pero mejora UX)
        document.getElementById('inputImagenCarro').addEventListener('change', function (event) {
            const previewContainer = document.getElementById('previewContainer');
            const imagenPreview = document.getElementById('imagenPreview');
            const file = event.target.files[0];

            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    imagenPreview.src = e.target.result;
                    previewContainer.style.display = 'block';
                }
                reader.readAsDataURL(file);
            } else {
                imagenPreview.src = '#';
                previewContainer.style.display = 'none';
            }
        });

        // Lógica para habilitar el botón de guardar del formulario principal
        // después de una consulta exitosa (ejemplo básico)
        document.getElementById('btnConsultar').addEventListener('click', function () {
            // Simular carga de datos
            document.getElementById('inputModeloArnes').value = 'XZ-2000-CONSULTADO';
            document.getElementById('inputProduccionEsperada').value = 600;
            document.getElementById('inputProduccionActual').value = 300;
            document.getElementById('inputEficiencia').value = '50%';

            // Habilitar el botón de guardar
            document.getElementById('btnGuardarInformacion').disabled = false;


        });

        document.addEventListener('DOMContentLoaded', async function () {
            // Lógica para cargar opciones de planta y línea
            const selectPlanta = document.getElementById('selectPlanta');
            const selectLinea = document.getElementById('selectLinea');

            const userDomain = await obtenerInformacionUsuario();

            console.log('Información del usuario:', userDomain);

            try {
                // Obtener datos de plantas desde el servidor
                const response = await fetch('/Home/GetPlants');
                
                if (!response.ok) {
                    throw new Error(`Error al obtener plantas: ${response.status}`);
                }
                
                const plantas = await response.json();
                
                // Limpiar opciones existentes (excepto la primera)
                selectPlanta.innerHTML = '<option selected disabled value="">Seleccione una planta...</option>';
                
                // Agregar nuevas opciones basadas en los datos recibidos
                plantas.forEach(planta => {
                    const option = document.createElement('option');
                    option.value = planta.id;
                    option.textContent = planta.nombre;
                    // Guardar datos adicionales como atributos de datos si es necesario
                    option.dataset.codigoTress = planta.codigoTress;
                    option.dataset.checadores = planta.checadoresDePlanta;
                    selectPlanta.appendChild(option);
                });
                
                console.log('Plantas cargadas:', plantas);
                
                // Agregar evento de cambio al select de plantas para cargar las líneas correspondientes
                selectPlanta.addEventListener('change', async function() {
                    const plantaId = this.value;
                    if (!plantaId) return;
                    
                    try {
                        // Mostrar indicador de carga
                        selectLinea.disabled = true;
                        selectLinea.innerHTML = '<option selected disabled value="">Cargando líneas...</option>';
                        
                        // Obtener líneas para la planta seleccionada
                        const responseLineas = await fetch(`/Home/GetLines?plant_id=${plantaId}`);
                        
                        if (!responseLineas.ok) {
                            throw new Error(`Error al obtener líneas: ${responseLineas.status}`);
                        }
                        
                        const lineas = await responseLineas.json();
                        
                        // Limpiar y agregar nuevas opciones
                        selectLinea.innerHTML = '<option selected disabled value="">Seleccione una línea...</option>';
                        
                        lineas.forEach(linea => {
                            const option = document.createElement('option');
                            option.value = linea.lineId;
                            option.textContent = linea.nombreLinea;
                            // Guardar datos adicionales como atributos de datos si es necesario
                            option.dataset.workProccess = linea.workProccess;
                            option.dataset.tressId = linea.tressId;
                            option.dataset.terminalEmpaque = linea.terminalEmpaque;
                            option.dataset.formacionPe = linea.formacionPe;
                            option.dataset.metaIPD = linea.metaIPD;
                            selectLinea.appendChild(option);
                        });
                        
                        console.log('Líneas cargadas:', lineas);
                        
                        // Habilitar el select de líneas
                        selectLinea.disabled = false;
                    } catch (error) {
                        console.error('Error al cargar líneas:', error);
                        selectLinea.innerHTML = '<option selected disabled value="">Error al cargar líneas</option>';
                        selectLinea.disabled = false;
                        alert('No se pudieron cargar las líneas. Por favor, intente nuevamente más tarde.');
                    }
                });
            } catch (error) {
                console.error('Error al cargar plantas:', error);
                // Mostrar mensaje de error al usuario
                alert('No se pudieron cargar las plantas. Por favor, intente nuevamente más tarde.');
            }
        });


        async function obtenerInformacionUsuario() {
    try {
        const response = await fetch(`/Home/GetUserDomain`);
        
        if (!response.ok) {
            throw new Error(`Error al obtener información del usuario: ${response.status}`);
        }
        
        const userDomain = await response.json();
        console.log('Información del usuario:', userDomain);
        
        // Actualizar el nombre de usuario en el footer
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay && userDomain.userName) {
            userNameDisplay.textContent = userDomain.userName;
        }
        
        return userDomain;
    } catch (error) {
        console.error('Error:', error);
        // Actualizar el footer con mensaje de error
        const userNameDisplay = document.getElementById('userNameDisplay');
        if (userNameDisplay) {
            userNameDisplay.textContent = 'No disponible';
        }
        // No mostrar alerta para no interrumpir la experiencia del usuario
        console.error('No se pudo obtener la información del usuario:', error);
        return null;
    }
}

// Llamar a la función cuando sea necesario
// obtenerInformacionUsuario();


// Función para subir la imagen del carro
async function subirImagenCarro() {
    try {
        // Obtener referencias a elementos del DOM
        const fileInput = document.getElementById('inputImagenCarro');
        const selectPlanta = document.getElementById('selectPlanta');
        const selectLinea = document.getElementById('selectLinea');
        
        // Validar que se haya seleccionado una planta y una línea
        if (!selectPlanta.value) {
            alert('Por favor, seleccione una planta.');
            return;
        }
        
        if (!selectLinea.value) {
            alert('Por favor, seleccione una línea.');
            return;
        }
        
        // Validar que se haya seleccionado un archivo
        if (!fileInput.files || fileInput.files.length === 0) {
            alert('Por favor, seleccione una imagen.');
            return;
        }
        
        // Obtener el archivo seleccionado
        const file = fileInput.files[0];
        
        // Validar que sea una imagen
        if (!file.type.startsWith('image/')) {
            alert('Por favor, seleccione un archivo de imagen válido.');
            return;
        }
        
        // Mostrar indicador de carga
        const btnSubirImagen = document.getElementById('btnSubirImagen');
        const originalText = btnSubirImagen.innerHTML;
        btnSubirImagen.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Subiendo...';
        btnSubirImagen.disabled = true;
        
        // Convertir la imagen a Base64
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                // Obtener la cadena Base64 (eliminar el prefijo "data:image/jpeg;base64,")
                const base64String = e.target.result.split(',')[1];
                
                // Obtener información del usuario para el campo registerUser
                const userDomainResponse = await fetch('/Home/GetUserDomain');
                
                if (!userDomainResponse.ok) {
                    throw new Error(`Error al obtener información del usuario: ${userDomainResponse.status}`);
                }
                
                const userDomain = await userDomainResponse.json();
                
                // Crear el objeto de solicitud
                const request = {
                    plant: selectPlanta.value,
                    lineId: selectLinea.value,
                    imageBase64: base64String, // Asegurarse de que este valor no esté vacío
                    registerUser: userDomain.userName || 'usuario_desconocido'
                };
                
                console.log('Enviando solicitud:', {
                    plant: request.plant,
                    lineId: request.lineId,
                    imageBase64: request.imageBase64 ? 'Base64 data (no mostrado por tamaño)' : 'VACÍO',
                    registerUser: request.registerUser
                });
                
                // Enviar la solicitud al servidor
                const response = await fetch('/Home/PostImageCar', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(request)
                });
                
                // Restaurar el botón
                btnSubirImagen.innerHTML = originalText;
                btnSubirImagen.disabled = false;
                
                // Verificar si la respuesta es exitosa
                if (response.ok) {
                    // Verificar si hay contenido en la respuesta
                    const responseText = await response.text();
                    
                    let result;
                    if (responseText && responseText.trim() !== '') {
                        try {
                            result = JSON.parse(responseText);
                        } catch (parseError) {
                            console.error('Error al analizar la respuesta JSON:', parseError);
                            console.log('Respuesta recibida:', responseText);
                            result = { msj: 'Imagen subida, pero hubo un problema al procesar la respuesta' };
                        }
                    } else {
                        // Si no hay contenido, crear un objeto de resultado predeterminado
                        result = { msj: 'Imagen subida correctamente' };
                    }
                    
                    alert(result.msj || 'Imagen subida correctamente');
                    
                    // Cerrar el modal
                    const modalElement = document.getElementById('modalCargarImagen');
                    if (modalElement) {
                        const modal = bootstrap.Modal.getInstance(modalElement);
                        if (modal) {
                            modal.hide();
                        } else {
                            // Si no se puede obtener la instancia, intentar cerrar de otra manera
                            $(modalElement).modal('hide');
                        }
                    }
                    
                    // Limpiar el formulario
                    document.getElementById('formCargarImagen').reset();
                    document.getElementById('previewContainer').style.display = 'none';
                } else {
                    // Manejar respuesta de error
                    try {
                        const errorText = await response.text();
                        let errorData;
                        
                        if (errorText && errorText.trim() !== '') {
                            try {
                                errorData = JSON.parse(errorText);
                            } catch (parseError) {
                                console.error('Error al analizar la respuesta de error:', parseError);
                                console.log('Respuesta de error recibida:', errorText);
                                errorData = { msj: `Error ${response.status}: ${response.statusText}` };
                            }
                        } else {
                            errorData = { msj: `Error ${response.status}: ${response.statusText}` };
                        }
                        
                        alert(`Error: ${errorData.msj || 'No se pudo subir la imagen'}`);
                    } catch (textError) {
                        alert(`Error: No se pudo subir la imagen (${response.status})`);
                    }
                }
            } catch (error) {
                // Restaurar el botón en caso de error
                btnSubirImagen.innerHTML = originalText;
                btnSubirImagen.disabled = false;
                
                console.error('Error al procesar la imagen:', error);
                alert(`Error al procesar la imagen: ${error.message}`);
            }
        };
        
        reader.readAsDataURL(file);
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        alert(`Error al subir la imagen: ${error.message}`);
    }
}

// Agregar el evento al botón de subir imagen cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    const btnSubirImagen = document.getElementById('btnSubirImagen');
    if (btnSubirImagen) {
        btnSubirImagen.addEventListener('click', subirImagenCarro);
    }
});
    