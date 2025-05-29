using AM_web.Services.Implementation;
using AM_web.Services.Interfaces;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();

// Registrar servicios
builder.Services.AddHttpClient();
builder.Services.AddScoped<IAssemby, AssemblyImp>();

// Registrar el servicio de empleado
builder.Services.AddHttpClient<IEmpleado, EmpleadoImp>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Monitor}/{action=Index}/{id?}");

app.Run();
