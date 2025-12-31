package com.example.foodvanposmobileapp;

import android.content.ContentValues;
import android.content.Context;
import android.database.sqlite.SQLiteDatabase;
import android.webkit.JavascriptInterface;

public class POSBridge {

    private POSDatabaseHelper dbHelper;

    public POSBridge(Context context) {
        dbHelper = new POSDatabaseHelper(context);
    }

    @JavascriptInterface
    public void saveSale(String date, String time, int total) {

        SQLiteDatabase db = dbHelper.getWritableDatabase();

        ContentValues cv = new ContentValues();
        cv.put("date", date);
        cv.put("time", time);
        cv.put("total", total);

        db.insert("sales", null, cv);
    }
}
