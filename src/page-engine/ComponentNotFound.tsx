import React from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { AlertTriangle, ExternalLink } from 'lucide-react';

export const ComponentNotFound: React.FC<{ componentName: string }> = ({ componentName }) => {
  const handleOpenCatalog = () => {
    window.open('/dev/components', '_blank');
  };

  return (
    <Card className="p-4 bg-red-900/20 border-red-500/30">
      <CardContent className="p-4">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <h3 className="text-red-400 font-medium mb-1">
            Компонент не зарегистрирован
          </h3>
          <p className="text-red-300/70 text-sm mb-3">
            {componentName}
          </p>
          <Button 
            size="sm" 
            variant="outline" 
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            onClick={handleOpenCatalog}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Открыть витрину
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

