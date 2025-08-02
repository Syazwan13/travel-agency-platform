import React from 'react';
import SpecificSelectorScraper from '../../components/packages/SpecificSelectorScraper';

const ScraperToolsPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Scraper Tools</h1>
      
      <div className="mb-8">
        <p className="text-center text-gray-600 mb-8">
          These tools help you scrape travel package data from various websites.
        </p>
      </div>
      
      <div className="mb-10">
        <SpecificSelectorScraper />
      </div>
    </div>
  );
};

export default ScraperToolsPage; 