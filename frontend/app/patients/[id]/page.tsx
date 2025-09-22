'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, FileText } from 'lucide-react'

export default function PatientDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [patient, setPatient] = useState<any>(null)

  useEffect(() => {
    const patients = JSON.parse(localStorage.getItem('patients') || '[]')
    const foundPatient = patients.find((p: any) => p.id === params.id)
    if (foundPatient) {
      setPatient(foundPatient)
    }
  }, [params.id])

  if (!patient) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 p-8">
      <div className="max-w-4xl mx-auto">
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => router.back()}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Patients
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>{patient.name}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Personal Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(patient.personalInfo || {}).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-500 capitalize">{key}</p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Medical Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Medical Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(patient.medicalInfo || {}).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-500 capitalize">{key}</p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Symptoms */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Symptoms</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(patient.symptoms || {}).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-sm text-gray-500 capitalize">{key}</p>
                      <p className="font-medium">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-6">
                <Button 
                  className="flex-1"
                  onClick={() => router.push(`/upload?patientId=${patient.id}`)}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  New Scan
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => router.push(`/results?patientId=${patient.id}`)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Results
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 