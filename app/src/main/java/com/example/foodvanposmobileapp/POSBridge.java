package com.example.foodvanposmobileapp;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;          // ✅ FIX
import android.database.sqlite.SQLiteDatabase;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class POSBridge {

    private final POSDatabaseHelper dbHelper;

    public POSBridge(Context context) {
        dbHelper = new POSDatabaseHelper(context);
    }

    @JavascriptInterface
    public void saveBill(String jsonPayload) {
        android.util.Log.d("POSBridge", "saveBill CALLED");

        SQLiteDatabase db = null;

        try {
            JSONObject payload = new JSONObject(jsonPayload);

            double total = payload.getDouble("total");
            double cash = payload.getDouble("cash");
            double balance = cash - total;
            JSONArray items = payload.getJSONArray("items");

            String date = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    .format(new Date());
            String time = new SimpleDateFormat("HH:mm:ss", Locale.getDefault())
                    .format(new Date());

            db = dbHelper.getWritableDatabase();
            db.beginTransaction();

            ContentValues billValues = new ContentValues();
            billValues.put("bill_no", System.currentTimeMillis());
            billValues.put("date", date);
            billValues.put("time", time);
            billValues.put("total", total);
            billValues.put("cash", cash);
            billValues.put("balance", balance);

            long billId = db.insertOrThrow("bills", null, billValues);

            for (int i = 0; i < items.length(); i++) {
                JSONObject item = items.getJSONObject(i);

                int qty = item.getInt("qty");
                double price = item.getDouble("price");
                double lineTotal = qty * price;

                ContentValues itemValues = new ContentValues();
                itemValues.put("bill_id", billId);
                itemValues.put("item_name", item.getString("name"));
                itemValues.put("qty", qty);
                itemValues.put("price", price);
                itemValues.put("line_total", lineTotal);

                db.insertOrThrow("bill_items", null, itemValues);
            }

            db.setTransactionSuccessful();

        } catch (Exception e) {
            android.util.Log.e("POSBridge", "saveBill FAILED", e);
        } finally {
            if (db != null) {
                db.endTransaction();
                db.close();
            }
        }
    }

    @JavascriptInterface
    public String getDailyReport() {
        JSONArray report = new JSONArray();
        SQLiteDatabase db = dbHelper.getReadableDatabase();

        String query =
                "SELECT item_name, SUM(qty) AS qty, SUM(line_total) AS value " +
                        "FROM bill_items " +
                        "GROUP BY item_name";

        try {
            Cursor cursor = db.rawQuery(query, null);

            while (cursor.moveToNext()) {
                JSONObject row = new JSONObject();
                row.put("name", cursor.getString(0));
                row.put("qty", cursor.getInt(1));
                row.put("value", cursor.getDouble(2));
                report.put(row);
            }

            cursor.close();
            db.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return report.toString();
    }
}
