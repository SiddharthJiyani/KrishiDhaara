package com.example.smart_irrigation_app.news.presentation

import androidx.compose.animation.animateContentSize
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.staggeredgrid.LazyVerticalStaggeredGrid
import androidx.compose.foundation.lazy.staggeredgrid.StaggeredGridCells
import androidx.compose.foundation.lazy.staggeredgrid.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.example.smart_irrigation_app.news.data.Article
import com.example.smart_irrigation_app.news.data.LatestArticle
import com.example.smart_irrigation_app.news.domain.NewsRepository
import com.example.smart_irrigation_app.news.latestnews.LatestNewsRepository
import com.example.smart_irrigation_app.ui.theme.DarkerGrey
import com.example.smart_irrigation_app.ui.theme.Green
import com.example.smart_irrigation_app.ui.theme.White
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// Composable Functions
@Composable
fun NewsPresenter() {
    val repository = remember { NewsRepository() }
    val agriNewsList = remember { mutableStateListOf<Article>() }
    val sciNewsList = remember { mutableStateListOf<Article>() }
    val extraNewsList = remember { mutableStateListOf<LatestArticle>() }
    val tabs = listOf("Latest", "Agriculture", "Science")
    val pagerState = rememberPagerState { tabs.size }
    val coroutineScope = rememberCoroutineScope()

    LaunchedEffect(Unit) {
        withContext(Dispatchers.IO) {
            try {
                val agriNews = repository.fetchAgricultureNews()
                val sciNews = repository.fetchScienceNews()
                val extraNews = LatestNewsRepository.fetchLatestNews()
                agriNewsList.addAll(agriNews.articles)
                sciNewsList.addAll(sciNews.articles)
                extraNewsList.addAll(extraNews)
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }
    }

    Column(
        modifier = Modifier.fillMaxSize(),
    ) {
        TabRow(
            selectedTabIndex = pagerState.currentPage,
            containerColor = DarkerGrey,
            indicator = { tabPositions ->
                TabRowDefaults.Indicator(
                    modifier = Modifier.tabIndicatorOffset(tabPositions[pagerState.currentPage]),
                    color = Green
                )
            }
        ) {
            tabs.forEachIndexed { index, s ->
                val selected = pagerState.currentPage == index
                TextButton(
                    modifier = Modifier
                        .fillMaxWidth(),
                    onClick = {
                        if (!selected) {
                            coroutineScope.launch {
                                pagerState.animateScrollToPage(index)
                            }
                        }
                    }
                ) {
                    Text(
                        text = s,
                        textAlign = TextAlign.Center,
                        color = White,
                    )
                }

            }
        }
        HorizontalPager(
            state = pagerState,
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) { index ->
            when (index) {
                0 -> {
                    val currentList = extraNewsList
                    if (currentList.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                color = Green
                            )
                        }
                    } else {
                        LazyVerticalStaggeredGrid(
                            columns = StaggeredGridCells.Fixed(2),
                            modifier = Modifier
                                .fillMaxSize()
                                .animateContentSize()
                                .padding(horizontal = 8.dp),
                            verticalItemSpacing = 8.dp,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            items(extraNewsList) { article ->
                                LatestNewsItem(
                                    article = article,
                                )
                            }
                        }
                    }
                }

                1 -> {
                    val currentList = agriNewsList
                    if (currentList.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                color = Green
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .animateContentSize(),
                            contentPadding = PaddingValues(8.dp)
                        ) {
                            items(currentList, key = { it.url }) { article ->
                                NewsItem(article)
                            }
                        }
                    }
                }

                else -> {
                    val currentList = sciNewsList
                    if (currentList.isEmpty()) {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                color = Green
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .animateContentSize(),
                            contentPadding = PaddingValues(8.dp)
                        ) {
                            items(currentList, key = { it.url }) { article ->
                                NewsItem(article)
                            }
                        }
                    }
                }
            }
        }
    }
}
