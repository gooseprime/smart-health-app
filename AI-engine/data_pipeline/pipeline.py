from data_pipeline.data_ingestion import DataIngestion
from data_pipeline.data_processing import DataProcessor
from data_pipeline.data_storage import DataStorage
import pandas as pd
from typing import Dict, Optional

class DataPipeline:
    """
    Main class for orchestrating the data pipeline.
    Handles ingestion, processing, and storage of time-series data.
    """
    
    def __init__(self, data_dir: str = "../data", output_dir: str = "../data"):
        """
        Initialize the DataPipeline class.
        
        Args:
            data_dir: Directory where input data files are stored
            output_dir: Directory where output files will be stored
        """
        self.ingestion = DataIngestion(data_dir)
        self.processor = DataProcessor()
        self.storage = DataStorage(output_dir)
        
    def run_pipeline(self, 
                    save_csv: bool = True, 
                    save_sqlite: bool = True,
                    csv_filename: str = "processed_data.csv",
                    sqlite_table: str = "processed_data") -> pd.DataFrame:
        """
        Run the complete data pipeline.
        
        Args:
            save_csv: Whether to save the processed data as CSV
            save_sqlite: Whether to save the processed data to SQLite
            csv_filename: Name of the CSV output file
            sqlite_table: Name of the SQLite table
            
        Returns:
            Processed and aligned DataFrame
        """
        # Step 1: Ingest data from all sources
        print("Step 1: Ingesting data from all sources...")
        data_dict = self.ingestion.load_all_data()
        
        # Step 2: Clean and align data
        print("Step 2: Cleaning and aligning data...")
        aligned_data = self.processor.align_by_date_region(data_dict)
        
        # Step 3: Create time features
        print("Step 3: Creating time features...")
        processed_data = self.processor.create_time_features(aligned_data)
        
        # Step 4: Store processed data
        print("Step 4: Storing processed data...")
        if save_csv:
            self.storage.save_to_csv(processed_data, csv_filename)
        
        if save_sqlite:
            self.storage.save_to_sqlite(processed_data, sqlite_table)
        
        print("Pipeline completed successfully!")
        return processed_data


if __name__ == "__main__":
    # Example usage
    pipeline = DataPipeline()
    processed_data = pipeline.run_pipeline()
    print(f"Processed data shape: {processed_data.shape}")
    print(f"Processed data columns: {processed_data.columns.tolist()}")