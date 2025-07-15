"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import ProjectForm from "@/components/forms/ProjectForm";

type Client = {
  id: string;
  name: string;
};

type Invoice = {
  id: string;
  invoice_no: string;
  invoice_date: string;
  status: string;
};

type LPO = {
  id: string;
  lpo_no: string;
  lpo_date: string;
  status: string;
  invoice: Invoice | null;
};

type Sale = {
  id: string;
  quantity: number;
  unit_price: number;
  purchase_cost: number;
  total_amount: number;
  status: string;
  sale_date: string;
  lpo: LPO | null;
};

type Project = {
  id: string;
  name: string;
  client: Client;
  clientId: string;
  sales: Sale[];
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects');
      if (!response.ok) throw new Error('Failed to fetch projects');
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const response = await fetch(`/api/projects?id=${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete project');
      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    setSelectedProject(null);
    fetchProjects();
  };

  const getTotalSales = (project: Project) => {
    return project.sales.reduce((total, sale) => total + sale.total_amount, 0);
  };

  const getTotalProfit = (project: Project) => {
    return project.sales.reduce((total, sale) => 
      total + (sale.total_amount - (sale.quantity * sale.purchase_cost)), 0
    );
  };

  const getPendingLPOs = (project: Project) => {
    return project.sales.filter(sale => sale.status === 'PENDING_LPO').length;
  };

  const getPendingInvoices = (project: Project) => {
    return project.sales.filter(sale => 
      sale.lpo && sale.lpo.status === 'INVOICE_PENDING'
    ).length;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (showForm) {
    return (
      <ProjectForm
        initialData={
          selectedProject
            ? {
                id: selectedProject.id,
                clientId: selectedProject.clientId,
                name: selectedProject.name,
              }
            : undefined
        }
        onSubmit={handleFormSubmit}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Button onClick={() => setShowForm(true)}>Add New Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{project.name}</span>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProject(project);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(project.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <strong>Client:</strong> {project.client.name}
                </p>
                <div className="pt-4 border-t mt-4">
                  <p className="text-sm">
                    <strong>Total Sales:</strong> {project.sales.length}
                  </p>
                  <p className="text-sm">
                    <strong>Total Amount:</strong> AED {getTotalSales(project).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Total Profit:</strong> AED {getTotalProfit(project).toLocaleString()}
                  </p>
                  <p className="text-sm">
                    <strong>Pending LPOs:</strong> {getPendingLPOs(project)}
                  </p>
                  <p className="text-sm">
                    <strong>Pending Invoices:</strong> {getPendingInvoices(project)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
