package com.vecinos.lluvia.data

import androidx.room.Entity
import androidx.room.PrimaryKey

/**
 * Tabla Room de Lluvia (Peldaño M2):
 * - fecha: Clave primaria (YYYY-MM-DD)
 * - mm: Precipitación registrada en milímetros (Double)
 */
@Entity(tableName = "lluvia")
data class LluviaEntity(
    @PrimaryKey
    val fecha: String,
    val mm: Double
)
