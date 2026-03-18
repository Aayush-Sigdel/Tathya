package org.example.tathyabackend.model;


public class Metrics {

    private Metric depthOfReporting;
    private Metric politicalBiasness;
    private Metric credibility;
    private Metric relevance;

    public Metrics(){

    }

    public Metric getDepthOfReporting() {
        return depthOfReporting;
    }

    public void setDepthOfReporting(Metric depthOfReporting) {
        this.depthOfReporting = depthOfReporting;
    }

    public Metric getPoliticalBiasness() {
        return politicalBiasness;
    }

    public void setPoliticalBiasness(Metric politicalBiasness) {
        this.politicalBiasness = politicalBiasness;
    }

    public Metric getCredibility() {
        return credibility;
    }

    public void setCredibility(Metric credibility) {
        this.credibility = credibility;
    }

    public Metric getRelevance() {
        return relevance;
    }

    public void setRelevance(Metric relevance) {
        this.relevance = relevance;
    }
}
