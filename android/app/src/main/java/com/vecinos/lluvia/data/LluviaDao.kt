package com.vecinos.lluvia.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface LluviaDao {
    /**
     * Guarda o sobrescribe la lluvia del día si ya existía registro para esa fecha.
     */
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun guardarLluvia(lluvia: LluviaEntity)

    /**
     * Retorna todos los registros ordenados cronológicamente descendente.
     */
    @Query("SELECT * FROM lluvia ORDER BY fecha DESC")
    fun obtenerTodas(): Flow<List<LluviaEntity>>

    /**
     * Elimina un registro por su clave primaria (fecha).
     */
    @Query("DELETE FROM lluvia WHERE fecha = :fecha")
    suspend fun borrarPorFecha(fecha: String)

    /**
     * Vacía toda la tabla.
     */
    @Query("DELETE FROM lluvia")
    suspend fun borrarTodo()
}
