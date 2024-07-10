package com.elasticsearch.search.service;

import co.elastic.clients.elasticsearch.core.search.Hit;
import com.elasticsearch.search.api.model.Result;
import com.elasticsearch.search.domain.EsClient;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class SearchService {

    private final EsClient esClient;

    public SearchService(EsClient esClient) {
        this.esClient = esClient;
    }

    public List<Result> submitQuery(String query) {
        var searchResponse = esClient.search(query);
        List<Hit<ObjectNode>> hits = searchResponse.hits().hits();

        var resultsList = hits.stream().map(h -> {
            String content = h.source().get("content").asText();
            String title = h.source().get("title").asText();
            String url = h.source().get("url").asText();

            // Obtendo os highlights do campo 'content'
            Map<String, List<String>> highlight = h.highlight();
            if (highlight != null && highlight.containsKey("content")) {
                List<String> highlightedContent = highlight.get("content");
                // Juntando os fragments de highlights
                content = String.join(" ... ", highlightedContent);
            }

            return new Result()
                    .abs(treatContent(content))
                    .title(title)
                    .url(url);
        }).collect(Collectors.toList());

        return resultsList;
    }

    private String treatContent(String content) {
        // Mantendo tags de destaque <em> usadas no highlight
        content = content.replaceAll("</?(som|math)\\d*>", "");
        content = content.replaceAll("[^A-Za-z\\s<em>/]+", "");
        content = content.replaceAll("\\s+", " ");
        content = content.replaceAll("^\\s+", "");
        return content;
    }

}
