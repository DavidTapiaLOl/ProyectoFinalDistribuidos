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


app.UseCors("AllowAll");
app.MapControllers();

app.Run();

[ApiController]
    [Route("api/email")]
    public class EmailController : ControllerBase
    {
        private readonly IHttpClientFactory _clientFactory;
        
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
                
                string email = "";
                if (body.TryGetProperty("email", out JsonElement emailElement))
                {
                    email = emailElement.GetString() ?? "";
                }

                if (string.IsNullOrEmpty(email)) return BadRequest(new { msg = "Email es requerido" });

                
                string otp = new Random().Next(1000, 9999).ToString();
                
                
                if (_otpStore.ContainsKey(email)) _otpStore[email] = otp;
                else _otpStore.Add(email, otp);

                Console.WriteLine($"[LOG] OTP Generado para {email}: {otp}");

                
                try 
                {
                    
                    
                    string pipedreamUrl = "https://eojitnp9kjh8sc9.m.pipedream.net"; 
                    

                    var client = _clientFactory.CreateClient();
                    
                    
                    var payload = new { email = email, otp = otp };
                    var jsonContent = JsonSerializer.Serialize(payload);
                    
                    
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

            
            if (_otpStore.ContainsKey(email) && _otpStore[email] == otp)
            {
                _otpStore.Remove(email); 
                return Ok(new { verified = true });
            }
            return BadRequest(new { verified = false, message = "Código incorrecto" });
        }
    }