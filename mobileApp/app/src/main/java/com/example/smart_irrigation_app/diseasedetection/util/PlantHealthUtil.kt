package com.example.smart_irrigation_app.diseasedetection.util


import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.net.Uri
import android.provider.MediaStore
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream


object FileUtil {

    /**
     * Converts a URI to a File
     * @param context Application context
     * @param uri URI to convert
     * @return File object or null if conversion fails
     */
    fun getFileFromUri(context: Context, uri: Uri): File? {
        try {
            val inputStream = context.contentResolver.openInputStream(uri)
            val fileName = getFileName(context, uri) ?: "temp_image.jpg"
            val file = File(context.cacheDir, fileName)

            inputStream?.use { input ->
                FileOutputStream(file).use { output ->
                    input.copyTo(output)
                }
            }

            return file
        } catch (e: Exception) {
            e.printStackTrace()
            return null
        }
    }

    /**
     * Gets the file name from a URI
     * @param context Application context
     * @param uri URI to get file name from
     * @return File name or null if not found
     */
    private fun getFileName(context: Context, uri: Uri): String? {
        var fileName: String? = null

        // Try to get the file name from the content resolver
        val cursor = context.contentResolver.query(uri, null, null, null, null)
        cursor?.use {
            if (it.moveToFirst()) {
                val displayNameIndex = it.getColumnIndex(MediaStore.MediaColumns.DISPLAY_NAME)
                if (displayNameIndex != -1) {
                    fileName = it.getString(displayNameIndex)
                }
            }
        }

        // If file name is still null, use the last path segment
        if (fileName == null) {
            fileName = uri.lastPathSegment
        }

        return fileName
    }

    /**
     * Compresses a bitmap to a file
     * @param bitmap Bitmap to compress
     * @param file File to save the compressed bitmap to
     * @param quality Compression quality (0-100)
     * @return true if successful, false otherwise
     */
    fun compressBitmapToFile(bitmap: Bitmap, file: File, quality: Int = 80): Boolean {
        return try {
            FileOutputStream(file).use { out ->
                bitmap.compress(Bitmap.CompressFormat.JPEG, quality, out)
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }

    /**
     * Decodes a URI to a bitmap with sample size to reduce memory usage
     * @param context Application context
     * @param uri URI to decode
     * @param reqWidth Required width
     * @param reqHeight Required height
     * @return Decoded bitmap or null if decoding fails
     */
    fun decodeSampledBitmapFromUri(
        context: Context,
        uri: Uri,
        reqWidth: Int,
        reqHeight: Int
    ): Bitmap? {
        return try {
            context.contentResolver.openInputStream(uri)?.use { inputStream ->
                decodeSampledBitmapFromStream(inputStream, reqWidth, reqHeight)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }

    /**
     * Decodes an input stream to a bitmap with sample size to reduce memory usage
     * @param inputStream Input stream to decode
     * @param reqWidth Required width
     * @param reqHeight Required height
     * @return Decoded bitmap or null if decoding fails
     */
    private fun decodeSampledBitmapFromStream(
        inputStream: InputStream,
        reqWidth: Int,
        reqHeight: Int
    ): Bitmap? {
        // First decode with inJustDecodeBounds=true to check dimensions
        val options = BitmapFactory.Options().apply {
            inJustDecodeBounds = true
        }

        // Reset the stream
        inputStream.mark(inputStream.available())
        BitmapFactory.decodeStream(inputStream, null, options)
        inputStream.reset()

        // Calculate inSampleSize
        options.apply {
            inSampleSize = calculateInSampleSize(this, reqWidth, reqHeight)
            inJustDecodeBounds = false
        }

        // Decode bitmap with inSampleSize set
        return BitmapFactory.decodeStream(inputStream, null, options)
    }

    /**
     * Calculates the sample size for bitmap decoding
     * @param options BitmapFactory.Options with out dimensions set
     * @param reqWidth Required width
     * @param reqHeight Required height
     * @return Sample size
     */
    private fun calculateInSampleSize(
        options: BitmapFactory.Options,
        reqWidth: Int,
        reqHeight: Int
    ): Int {
        // Raw height and width of image
        val (height: Int, width: Int) = options.run { outHeight to outWidth }
        var inSampleSize = 1

        if (height > reqHeight || width > reqWidth) {
            val halfHeight: Int = height / 2
            val halfWidth: Int = width / 2

            // Calculate the largest inSampleSize value that is a power of 2 and keeps both
            // height and width larger than the requested height and width.
            while (halfHeight / inSampleSize >= reqHeight && halfWidth / inSampleSize >= reqWidth) {
                inSampleSize *= 2
            }
        }

        return inSampleSize
    }
}

