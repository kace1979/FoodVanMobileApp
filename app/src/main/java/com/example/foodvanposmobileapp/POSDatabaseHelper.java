package com.example.foodvanposmobileapp;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
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
                "CREATE TABLE bills (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                        "bill_no INTEGER," +
                        "date TEXT," +
                        "time TEXT," +
                        "total REAL," +
                        "cash REAL," +
                        "balance REAL)"
        );

        db.execSQL(
                "CREATE TABLE bill_items (" +
                        "id INTEGER PRIMARY KEY AUTOINCREMENT," +
                        "bill_id INTEGER," +
                        "item_name TEXT," +
                        "qty INTEGER," +
                        "price REAL," +
                        "line_total REAL)"
        );
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldVersion, int newVersion) {
        db.execSQL("DROP TABLE IF EXISTS bills");
        db.execSQL("DROP TABLE IF EXISTS bill_items");
        onCreate(db);
    }

    // Insert bill header
    public long insertBill(int billNo, String date, String time,
                           double total, double cash, double balance) {

        SQLiteDatabase db = getWritableDatabase();
        ContentValues cv = new ContentValues();

        cv.put("bill_no", billNo);
        cv.put("date", date);
        cv.put("time", time);
        cv.put("total", total);
        cv.put("cash", cash);
        cv.put("balance", balance);

        return db.insert("bills", null, cv);
    }

    // Insert bill item
    public void insertBillItem(long billId, String name,
                               int qty, double price, double lineTotal) {

        SQLiteDatabase db = getWritableDatabase();
        ContentValues cv = new ContentValues();

        cv.put("bill_id", billId);
        cv.put("item_name", name);
        cv.put("qty", qty);
        cv.put("price", price);
        cv.put("line_total", lineTotal);

        db.insert("bill_items", null, cv);
    }

    // Daily item summary
    public Cursor getTodayItemSummary(String date) {
        SQLiteDatabase db = getReadableDatabase();

        return db.rawQuery(
                "SELECT item_name, SUM(qty) AS total_qty, SUM(line_total) AS total_amount " +
                        "FROM bill_items bi " +
                        "JOIN bills b ON bi.bill_id = b.id " +
                        "WHERE b.date = ? " +
                        "GROUP BY item_name",
                new String[]{date}
        );
    }
}
