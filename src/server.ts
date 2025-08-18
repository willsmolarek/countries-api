import express, { Request, Response } from 'express';
import cors from 'cors';
import { CountryService } from './countryService';
import { Region } from './types';

const app = express();
const port = process.env.PORT || 3000;
const countryService = new CountryService();

// Middlewares
app.use(cors());
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Get all countries
app.get('/countries', async (req: Request, res: Response) => {
  try {
    const countries = await countryService.getAllCountries();
    res.json(countries);
  } catch (error) {
    console.error('Error in /countries:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
});

// Search countries by name
app.get('/countries/search', async (req: Request, res: Response) => {
  try {
    const name = req.query.name as string;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    const countries = await countryService.searchByName(name);
    res.json(countries);
  } catch (error) {
    console.error('Error in /countries/search:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
});

// Filter countries by region
app.get('/countries/region/:region', async (req: Request, res: Response) => {
  try {
    const region = req.params.region as Region;
    
    if (!Object.values(Region).includes(region)) {
      return res.status(400).json({ 
        error: 'Invalid region',
        validRegions: Object.values(Region)
      });
    }

    const countries = await countryService.filterByRegion(region);
    res.json(countries);
  } catch (error) {
    console.error('Error in /countries/region:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        error: error.message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
      });
    } else {
      res.status(500).json({ error: 'Unknown error occurred' });
    }
  }
});

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error Handling Middleware
app.use((error: unknown, req: Request, res: Response) => {
  console.error('Unhandled error:', error);
  
  if (error instanceof Error) {
    res.status(500).json({ 
      error: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  } else {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log(`API Documentation:`);
  console.log(`- Health Check: GET /health`);
  console.log(`- All Countries: GET /countries`);
  console.log(`- Search by Name: GET /countries/search?name={name}`);
  console.log(`- Filter by Region: GET /countries/region/{region}`);
});