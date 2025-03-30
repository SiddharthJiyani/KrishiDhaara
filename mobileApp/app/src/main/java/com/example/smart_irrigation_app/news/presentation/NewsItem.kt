package com.example.smart_irrigation_app.news.presentation

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import coil.compose.AsyncImage
import com.example.smart_irrigation_app.news.data.Article
import com.example.smart_irrigation_app.news.data.LatestArticle
import com.example.smart_irrigation_app.ui.theme.Black
import com.example.smart_irrigation_app.ui.theme.Blue
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.greenBrush

@Composable
fun NewsItem(article: Article) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize()
    ) {
        Spacer(Modifier.size(8.dp))
        article.urlToImage?.let {
            AsyncImage(
                model = it,
                contentDescription = null,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(5))
                    .background(greenBrush)
            )
        }
        Spacer(Modifier.size(8.dp))
        Text(
            article.title,
            color = Blue,
            style = MaterialTheme.typography.titleLarge
        )
        Spacer(Modifier.size(8.dp))
        Text(
            article.description ?: "No Description",
            style = MaterialTheme.typography.bodyMedium
        )
        Spacer(Modifier.size(8.dp))
        Text(
            "Source: ${article.source.name}",
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Right,
            color = Green,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

@Composable
fun LatestNewsItem(article: LatestArticle) {
    val context = LocalContext.current
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .animateContentSize()
    ) {
        Spacer(Modifier.size(8.dp))
        Box {
            article.image?.let {
                AsyncImage(
                    model = it,
                    contentDescription = null,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(5))
                        .background(greenBrush)
                        .align(Alignment.Center)
                )
            }
            article.link?.let {
                IconButton(
                    modifier = Modifier
                        .align(Alignment.TopEnd),
                    onClick = {
                        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(it))
                        ContextCompat.startActivity(context, intent, null)
                    }
                ) {
                    Icon(
                        painterResource(com.example.smart_irrigation_app.R.drawable.baseline_arrow_outward_24),
                        contentDescription = null,
                        tint = Green,
                        modifier = Modifier
                            .size(30.dp)
                            .background(Black.copy(alpha = 0.4f), RoundedCornerShape(50))
                            .padding(4.dp)
                    )
                }
            }
        }
        Spacer(Modifier.size(8.dp))
        Text(
            "Source: ${article.source}",
            modifier = Modifier.fillMaxWidth(),
            textAlign = TextAlign.Left,
            color = Green,
            style = MaterialTheme.typography.labelSmall,
            fontSize = 12.sp
        )
        Spacer(Modifier.size(8.dp))
        Text(
            article.title,
            color = Blue,
            style = MaterialTheme.typography.titleSmall,
            fontSize = 15.sp
        )
        Spacer(Modifier.size(8.dp))
        Text(
            article.category ?: "No Category",
            style = MaterialTheme.typography.labelMedium
        )
    }
}
