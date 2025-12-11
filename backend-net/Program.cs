using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Net.Http;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddHttpClient();

// Configuración CORS permisiva para evitar bloqueos en desarrollo
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

var app = builder.Build();

// ¡IMPORTANTE! UseCors debe ir antes de MapControllers
app.UseCors("AllowAll");
app.MapControllers();

app.Run();

[ApiController]
    [Route("api/email")]
    public class EmailController : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory;
        // Almacén temporal de OTPs (Se borra si reinicias el servidor)
        private static Dictionary<string, string> _otpStore = new Dictionary<string, string>();

        public EmailController(IHttpClientFactory clientFactory)
        {
            _clientFactory = clientFactory;
        }

        [HttpPost("solicitar-otp")]
        public async Task<IActionResult> RequestOtp([FromBody] JsonElement body)
        {
            try 
            {
                // 1. Extraer el email del cuerpo de la petición
                string email = "";
                if (body.TryGetProperty("email", out JsonElement emailElement))
                {
                    email = emailElement.GetString() ?? "";
                }

                if (string.IsNullOrEmpty(email)) return BadRequest(new { msg = "Email es requerido" });

                // 2. Generar OTP (4 dígitos)
                string otp = new Random().Next(1000, 9999).ToString();
                
                // 3. Guardar OTP en memoria (Sobreescribe si ya existe)
                if (_otpStore.ContainsKey(email)) _otpStore[email] = otp;
                else _otpStore.Add(email, otp);

                Console.WriteLine($"[LOG] OTP Generado para {email}: {otp}");

                // 4. ENVIAR A PIPEDREAM (Aquí ocurre la magia)
                try 
                {
                    // ---------------------------------------------------------
                    // ⚠️ PEGA AQUÍ TU URL DE PIPEDREAM QUE EMPIEZA CON https://eo...
                    string pipedreamUrl = "https://eojitnp9kjh8sc9.m.pipedream.net"; 
                    // ---------------------------------------------------------

                    var client = _clientFactory.CreateClient();
                    
                    // Preparamos los datos tal cual los espera Pipedream
                    var payload = new { email = email, otp = otp };
                    var jsonContent = JsonSerializer.Serialize(payload);
                    
                    // Enviamos la petición POST
                    var response = await client.PostAsync(pipedreamUrl, new StringContent(jsonContent, Encoding.UTF8, "application/json"));

                    if(response.IsSuccessStatusCode)
                    {
                        Console.WriteLine("[EXITO] Enviado a Pipedream correctamente.");
                    }
                    else 
                    {
                         Console.WriteLine($"[ERROR PIPEDREAM] Status: {response.StatusCode}");
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[ERROR DE CONEXIÓN] No se pudo contactar a Pipedream: {ex.Message}");
                    // No hacemos throw para no romper el flujo del usuario, aunque no llegue el correo
                }
                
                return Ok(new { msg = "OTP Generado y enviado por correo" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[ERROR CRITICO] {ex.Message}");
                return StatusCode(500, new { error = ex.Message });
            }
        }

        [HttpPost("verificar-otp")]
        public IActionResult VerifyOtp([FromBody] JsonElement body)
        {
            string email = "";
            string otp = "";

            if (body.TryGetProperty("email", out JsonElement emailEl)) email = emailEl.GetString();
            if (body.TryGetProperty("otp", out JsonElement otpEl)) otp = otpEl.GetString();

            // Verificamos si existe la llave y si el valor coincide
            if (_otpStore.ContainsKey(email) && _otpStore[email] == otp)
            {
                _otpStore.Remove(email); // OTP de un solo uso, lo borramos tras usarlo
                return Ok(new { verified = true });
            }
            return BadRequest(new { verified = false, message = "Código incorrecto" });
        }
    }