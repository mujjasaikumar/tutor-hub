import React, { useEffect, useState } from 'react';
import Layout from '@/components/shared/Layout';
import api from '@/api/axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText } from 'lucide-react';

export default function TutorMaterials() {
  const [materials, setMaterials] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    drive_link: '',
    batch_id: '',
    expiry_date: '',
  });

  useEffect(() => {
    fetchMaterials();
    fetchBatches();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/materials');
      setMaterials(response.data);
    } catch (error) {
      toast.error('Failed to fetch materials');
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const response = await api.get('/batches');
      setBatches(response.data);
    } catch (error) {
      console.error('Failed to fetch batches:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        ...formData,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
      };
      
      await api.post('/materials', payload);
      
      toast.success('Material uploaded successfully!');
      setDialogOpen(false);
      fetchMaterials();
      setFormData({
        title: '',
        description: '',
        drive_link: '',
        batch_id: '',
        expiry_date: '',
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload material');
    }
  };

  return (
    <Layout role="tutor">
      <div className="space-y-6" data-testid="tutor-materials-page">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              Study Materials
            </h1>
            <p className="text-gray-600 mt-1">Upload and manage study materials</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700" data-testid="upload-material-button">
                <Plus className="w-4 h-4 mr-2" />
                Upload Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md" data-testid="upload-material-dialog">
              <DialogHeader>
                <DialogTitle>Upload Study Material</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    data-testid="material-title-input"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    data-testid="material-description-input"
                  />
                </div>
                <div>
                  <Label htmlFor="drive_link">Google Drive Link</Label>
                  <Input
                    id="drive_link"
                    value={formData.drive_link}
                    onChange={(e) => setFormData({ ...formData, drive_link: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    required
                    data-testid="material-link-input"
                  />
                </div>
                <div>
                  <Label htmlFor="batch_id">Batch</Label>
                  <Select value={formData.batch_id} onValueChange={(value) => setFormData({ ...formData, batch_id: value })}>
                    <SelectTrigger data-testid="material-batch-select">
                      <SelectValue placeholder="Select batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="expiry_date">Expiry Date (Optional)</Label>
                  <Input
                    id="expiry_date"
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                    data-testid="material-expiry-input"
                  />
                </div>
                <Button type="submit" className="w-full" data-testid="submit-material-button">
                  Upload Material
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : materials.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No materials uploaded yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.map((material) => (
              <Card key={material.id} className="hover:shadow-lg transition-shadow" data-testid={`material-card-${material.id}`}>
                <CardContent className="p-6 space-y-3">
                  <h3 className="font-semibold text-lg">{material.title}</h3>
                  <p className="text-sm text-gray-600">{material.description}</p>
                  <div className="text-sm space-y-1">
                    <div className="text-gray-600">Batch: {material.batch_name}</div>
                    {material.expiry_date && (
                      <div className="text-gray-600">
                        Expires: {new Date(material.expiry_date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  <a
                    href={material.drive_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    View Material →
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
