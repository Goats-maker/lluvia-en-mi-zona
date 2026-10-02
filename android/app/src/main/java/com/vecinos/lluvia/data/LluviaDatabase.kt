package com.vecinos.lluvia.data

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase

@Database(entities = [LluviaEntity::class], version = 1, exportSchema = false)
abstract class LluviaDatabase : RoomDatabase() {
    abstract fun lluviaDao(): LluviaDao

    companion object {
        @Volatile
        private var INSTANCE: LluviaDatabase? = null

        fun getDatabase(context: Context): LluviaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    LluviaDatabase::class.java,
                    "lluvia_db"
                ).build()
                INSTANCE = instance
                instance
            }
        }
    }
}
