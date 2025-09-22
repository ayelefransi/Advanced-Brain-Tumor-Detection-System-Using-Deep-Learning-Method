'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { createPatient } from '@/utils/api'
import { useToast } from '@/components/ui/use-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, User, ClipboardList, Stethoscope, Activity, AlertCircle } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function PatientInfoPage() {
  const [activeTab, setActiveTab] = useState('personal')
  const [formData, setFormData] = useState({
    personalInfo: {
      name: '',
      age: '',
      gender: '',
      dob: '',
      contact: '',
      email: '',
      address: ''
    },
    medicalInfo: {
      height: '',
      weight: '',
      bloodType: '',
      allergies: '',
      medications: '',
      medicalHistory: ''
    },
    symptoms: {
      current: '',
      duration: '',
      severity: '',
      previousTreatments: '',
      additionalNotes: ''
    }
  })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleInputChange = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Format the patient data
      const patientData = {
        name: formData.personalInfo.name,
        age: parseInt(formData.personalInfo.age),
        gender: formData.personalInfo.gender,
        dob: formData.personalInfo.dob,
        contact: formData.personalInfo.contact,
        email: formData.personalInfo.email,
        address: formData.personalInfo.address,
        status: 'Pending',
        scanCount: 0,
        riskLevel: 'Low',
        lastScan: '-',
        nextAppointment: '-',
        diagnosis: '-',
        medicalInfo: formData.medicalInfo,
        symptoms: formData.symptoms
      }

      // Save directly to localStorage
      const existingPatients = JSON.parse(localStorage.getItem('patients') || '[]')
      const newPatient = {
        id: `patient_${Date.now()}`,
        ...patientData,
        createdAt: new Date().toISOString()
      }
      
      const updatedPatients = [...existingPatients, newPatient]
      localStorage.setItem('patients', JSON.stringify(updatedPatients))

      // Trigger storage event for header update
      window.dispatchEvent(new Event('storage'))

      toast({
        title: "Success",
        description: "Patient information saved successfully"
      })

      router.push(`/upload?patientId=${newPatient.id}`)

    } catch (error: any) {
      console.error('Save error:', error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to save information"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="p-6 shadow-lg">
          <form onSubmit={handleSubmit}>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Info
                </TabsTrigger>
                <TabsTrigger value="medical" className="flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Medical History
                </TabsTrigger>
                <TabsTrigger value="symptoms" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Symptoms
                </TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.personalInfo.name}
                      onChange={(e) => handleInputChange('personalInfo', 'name', e.target.value)}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Age</Label>
                    <Input
                      type="number"
                      value={formData.personalInfo.age}
                      onChange={(e) => handleInputChange('personalInfo', 'age', e.target.value)}
                      placeholder="Enter age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth</Label>
                    <Input
                      type="date"
                      value={formData.personalInfo.dob}
                      onChange={(e) => handleInputChange('personalInfo', 'dob', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select 
                      value={formData.personalInfo.gender}
                      onValueChange={(value) => handleInputChange('personalInfo', 'gender', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Number</Label>
                    <Input
                      value={formData.personalInfo.contact}
                      onChange={(e) => handleInputChange('personalInfo', 'contact', e.target.value)}
                      placeholder="Enter contact number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.personalInfo.email}
                      onChange={(e) => handleInputChange('personalInfo', 'email', e.target.value)}
                      placeholder="Enter email address"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Address</Label>
                    <Textarea
                      value={formData.personalInfo.address}
                      onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
                      placeholder="Enter full address"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="medical" className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Height (cm)</Label>
                    <Input
                      type="number"
                      value={formData.medicalInfo.height}
                      onChange={(e) => handleInputChange('medicalInfo', 'height', e.target.value)}
                      placeholder="Enter height"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Weight (kg)</Label>
                    <Input
                      type="number"
                      value={formData.medicalInfo.weight}
                      onChange={(e) => handleInputChange('medicalInfo', 'weight', e.target.value)}
                      placeholder="Enter weight"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Blood Type</Label>
                    <Select
                      value={formData.medicalInfo.bloodType}
                      onValueChange={(value) => handleInputChange('medicalInfo', 'bloodType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Allergies</Label>
                    <Input
                      value={formData.medicalInfo.allergies}
                      onChange={(e) => handleInputChange('medicalInfo', 'allergies', e.target.value)}
                      placeholder="List any allergies"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Current Medications</Label>
                    <Textarea
                      value={formData.medicalInfo.medications}
                      onChange={(e) => handleInputChange('medicalInfo', 'medications', e.target.value)}
                      placeholder="List current medications"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Medical History</Label>
                    <Textarea
                      value={formData.medicalInfo.medicalHistory}
                      onChange={(e) => handleInputChange('medicalInfo', 'medicalHistory', e.target.value)}
                      placeholder="Describe medical history"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="symptoms" className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Current Symptoms</Label>
                    <Textarea
                      value={formData.symptoms.current}
                      onChange={(e) => handleInputChange('symptoms', 'current', e.target.value)}
                      placeholder="Describe current symptoms"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Duration</Label>
                      <Input
                        value={formData.symptoms.duration}
                        onChange={(e) => handleInputChange('symptoms', 'duration', e.target.value)}
                        placeholder="How long have you had these symptoms?"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Severity (1-10)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={formData.symptoms.severity}
                        onChange={(e) => handleInputChange('symptoms', 'severity', e.target.value)}
                        placeholder="Rate severity"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Previous Treatments</Label>
                    <Textarea
                      value={formData.symptoms.previousTreatments}
                      onChange={(e) => handleInputChange('symptoms', 'previousTreatments', e.target.value)}
                      placeholder="List any previous treatments"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Additional Notes</Label>
                    <Textarea
                      value={formData.symptoms.additionalNotes}
                      onChange={(e) => handleInputChange('symptoms', 'additionalNotes', e.target.value)}
                      placeholder="Any additional information"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end mt-6">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save Patient Information'
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
