package com.vecinos.lluvia

import android.os.Bundle
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.vecinos.lluvia.data.LluviaDatabase
import com.vecinos.lluvia.data.LluviaEntity
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val db = LluviaDatabase.getDatabase(this)
        val dao = db.lluviaDao()

        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF0F172A)
                ) {
                    LluviaScreen(dao = dao)
                }
            }
        }
    }
}

/**
 * UMBRAL DE ALERTA CONSTANTE: 80 mm (Peldaños P0 / M1)
 */
const val UMBRAL_ALERTA_MM = 80.0

@Composable
fun LluviaScreen(dao: com.vecinos.lluvia.data.LluviaDao) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val registros by dao.obtenerTodas().collectAsState(initial = emptyList())

    val sdf = remember { SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()) }
    val hoyStr = remember { sdf.format(Date()) }

    var fechaSeleccionada by remember { mutableStateOf(hoyStr) }
    var mmInput by remember { mutableStateOf("") }
    var errorMensaje by remember { mutableStateOf<String?>(null) }

    // CÁLCULO DE LAS ÚLTIMAS 72 HORAS (P0 / M1):
    // Hoy y los 2 días anteriores en formato yyyy-MM-dd
    val fechas72h = remember {
        val cal = Calendar.getInstance()
        val f0 = sdf.format(cal.time)
        cal.add(Calendar.DAY_OF_YEAR, -1)
        val f1 = sdf.format(cal.time)
        cal.add(Calendar.DAY_OF_YEAR, -1)
        val f2 = sdf.format(cal.time)
        listOf(f0, f1, f2)
    }

    val acumulado72h = remember(registros) {
        registros.filter { it.fecha in fechas72h }.sumOf { it.mm }
    }
    val superaUmbral = acumulado72h >= UMBRAL_ALERTA_MM

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // 1. BANNER DE ALERTA VISIBLE (P0: Rojo si >= 80mm, Verde si < 80mm)
        item {
            Card(
                colors = CardDefaults.cardColors(
                    containerColor = if (superaUmbral) Color(0xFFDC2626) else Color(0xFF059669)
                ),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = if (superaUmbral) Icons.Default.Warning else Icons.Default.CheckCircle,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(36.dp)
                    )
                    Column {
                        Text(
                            text = if (superaUmbral) "¡ALERTA ROJA! RIESGO DE DESBORDE" else "NIVEL DE LLUVIA NORMAL",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White
                        )
                        Text(
                            text = if (superaUmbral) "Acumulado superó el umbral de ${UMBRAL_ALERTA_MM.toInt()} mm"
                            else "Acumulado por debajo del umbral de ${UMBRAL_ALERTA_MM.toInt()} mm",
                            fontSize = 14.sp,
                            color = Color.White.copy(alpha = 0.9f)
                        )
                    }
                }
            }
        }

        // 2. CONTADOR GRANDE DE 72 HORAS (P0)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "ACUMULADO ÚLTIMAS 72 HORAS",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF94A3B8)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = String.format(Locale.getDefault(), "%.1f mm", acumulado72h),
                        fontSize = 54.sp,
                        fontWeight = FontWeight.Black,
                        color = if (superaUmbral) Color(0xFFF87171) else Color(0xFF34D399)
                    )
                }
            }
        }

        // 3. FORMULARIO REGISTRAR LLUVIA (P0 / M3 / M4)
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = "Registrar lluvia del día",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    OutlinedTextField(
                        value = fechaSeleccionada,
                        onValueChange = { fechaSeleccionada = it },
                        label = { Text("Fecha (YYYY-MM-DD)") },
                        modifier = Modifier.fillMaxWidth()
                    )

                    OutlinedTextField(
                        value = mmInput,
                        onValueChange = {
                            mmInput = it
                            errorMensaje = null
                        },
                        label = { Text("Milímetros de lluvia (mm)") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        modifier = Modifier.fillMaxWidth()
                    )

                    errorMensaje?.let {
                        Text(text = it, color = Color(0xFFEF4444), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }

                    // Botón principal único (P0 / M3)
                    Button(
                        onClick = {
                            val valorLimpio = mmInput.trim().replace(',', '.')
                            val mm = valorLimpio.toDoubleOrNull()
                            if (mm == null || mm < 0.0) {
                                errorMensaje = "Ingresá un número válido mayor o igual a 0."
                                return@Button
                            }
                            if (mm > 500.0) {
                                errorMensaje = "Valor inverosímil (> 500 mm)."
                                return@Button
                            }

                            coroutineScope.launch {
                                dao.guardarLluvia(LluviaEntity(fecha = fechaSeleccionada, mm = mm))
                                mmInput = ""
                                Toast.makeText(context, "Lluvia guardada correctamente", Toast.LENGTH_SHORT).show()
                            }
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp)
                    ) {
                        Text("Guardar lluvia del día", fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        // 4. HISTÓRICO DE MEDICIONES (M2)
        item {
            Text(
                text = "Histórico de Registros (${registros.size})",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
        }

        items(registros) { registro ->
            Card(
                colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(12.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(registro.fecha, fontWeight = FontWeight.Bold, color = Color.White)
                        if (registro.fecha in fechas72h) {
                            Text("En ventana 72h", fontSize = 12.sp, color = Color(0xFF38BDF8))
                        }
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "${registro.mm} mm",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = Color(0xFF38BDF8)
                        )
                        IconButton(onClick = {
                            coroutineScope.launch { dao.borrarPorFecha(registro.fecha) }
                        }) {
                            Icon(Icons.Default.Delete, contentDescription = "Borrar", tint = Color(0xFF94A3B8))
                        }
                    }
                }
            }
        }
    }
}
