package com.example.foodvanposmobileapp;

import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;

public class POSDatabaseHelper extends SQLiteOpenHelper {

    private static final String DB_NAME = "foodvan_pos.db";
    private static final int DB_VERSION = 1;

    public POSDatabaseHelper(Context context) {
        super(context, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {

        db.execSQL(
                "CREATE TABLE sales (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                        "date TEXT," +
                        "time TEXT," +
                        "total INTEGER)"
        );

        db.execSQL(
                "CREATE TABLE sale_items (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                        "sale_id INTEGER," +
                        "item_name TEXT," +
                        "qty INTEGER," +
                        "price INTEGER)"
        );
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        // future upgrades
    }
}
