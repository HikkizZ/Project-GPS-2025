import React from 'react';
import { Card, CardContent, Typography } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  return (
    <div>
      <Link to="/recursos-humanos" style={{ textDecoration: 'none' }}>
        <Card className="dashboard-card">
          <CardContent>
            <Typography variant="h5" component="div" className="card-title">
              Recursos Humanos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona trabajadores, fichas y usuarios
            </Typography>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
};

export default DashboardPage; 