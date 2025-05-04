package com.contactlistapp;

import android.Manifest;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.provider.ContactsContract;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.*;

class ContactModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ContactModule"
    }

    @ReactMethod
    fun getContacts(promise: Promise) {
        val activity: Activity = currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "No current activity")
            return
        }

        if (ContextCompat.checkSelfPermission(
                activity,
                Manifest.permission.READ_CONTACTS
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            ActivityCompat.requestPermissions(
                activity,
                arrayOf(Manifest.permission.READ_CONTACTS),
                1
            )
            promise.reject("PERMISSION_DENIED", "Permission not granted")
            return
        }

        val contacts = Arguments.createArray()
        val contentResolver: ContentResolver = activity.contentResolver
        val cursor: Cursor? = contentResolver.query(
            ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
            null, null, null, null
        )

        cursor?.use {
            while (it.moveToNext()) {
                val name = it.getString(it.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME))
                val phone = it.getString(it.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone.NUMBER))

                val contact = Arguments.createMap().apply {
                    putString("name", name)
                    putString("phone", phone)
                }
                contacts.pushMap(contact)
            }
        }

        promise.resolve(contacts)
    }
}
