/*
   Copyright 2015-2016 AllThingsTalk

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*/  

/****
 *  AllThingsTalk Developer Cloud IoT experiment for LoRa
 *  Version 1.0 dd 09/11/2015
 *  Original author: Jan Bogaerts 2015
 *
 *  This sketch is part of the AllThingsTalk LoRa rapid development kit
 *  -> http://www.allthingstalk.com/lora-rapid-development-kit
 *
 *  This example sketch is based on the Proxilmus IoT network in Belgium
 *  The sketch and libs included support the
 *  - MicroChip RN2483 LoRa module
 *  - Embit LoRa modem EMB-LR1272
 *  
 *  For more information, please check our documentation
 *  -> http://allthingstalk.com/docs/tutorials/lora/setup
 *  
 **/

#include <Wire.h>
#include <ATT_LoRa_IOT.h>
#include "keys.h"
#include <MicrochipLoRaModem.h>
#include "AirQuality2.h"
#include"Arduino.h"
#include "Sodaq_TPH.h"
#include <SPI.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_BME280.h>

#define BME_SCK 13
#define BME_MISO 12
#define BME_MOSI 11
#define BME_CS 10

#define SERIAL_BAUD 57600

#define LightSensor A2
#define AirQSensor A0
#define SoundSensor A4
int DoorSensor  = 4;

MicrochipLoRaModem Modem(&Serial1, &Serial);
ATTDevice Device(&Modem, &Serial);
AirQuality2 airqualitysensor;
Adafruit_BME280 bme; // I2C


void setup() 
{
  pinMode(LightSensor,INPUT);
  pinMode(SoundSensor, INPUT);   
  pinMode(DoorSensor, INPUT);
  airqualitysensor.init(AirQSensor);
  while((!Serial) && (millis()) < 2000){}            //wait until serial bus is available, so we get the correct logging on screen. If no serial, then blocks for 2 seconds before run
  Serial.begin(SERIAL_BAUD);
  Serial1.begin(Modem.getDefaultBaudRate());          // init the baud rate of the serial connection so that it's ok for the modem
  Device.Connect(DEV_ADDR, APPSKEY, NWKSKEY);
  Serial.println(F("BME280 test"));

  if (!bme.begin()) {
    Serial.println("Could not find a valid BME280 sensor, check wiring!");
    while (1);
  }
  Serial.println("Ready to send data");

  delay(2000);
}

float LightSensorValue = 0;
bool DoorSensorRead = true;
short airQValue;
short soundValue;
float temp;
float hum;
float pres;

void loop() 
{
  
  //Humidity Sensor
  hum = bme.readHumidity();
  Serial.print("Humidity: ");
  Serial.print(hum);
  Serial.print("%");
    Serial.println();
  Device.Send(hum, HUMIDITY_SENSOR);
  delay(300000);
  
  //Temperature Sensor
  temp = bme.readTemperature();
  Serial.print("Temperature = ");
  Serial.print(temp);
  Serial.print(" degrees Celcius");
    Serial.println();
  Device.Send(temp, TEMPERATURE_SENSOR);
  delay(300000);

  //Pressure Sensor
  pres = bme.readPressure()/100.0;
  Serial.print("Pressure: ");
  Serial.print(pres);
  Serial.print("hPa");
    Serial.println();
  Device.Send(pres, PRESSURE_SENSOR);
  delay(300000);
  
  //Light Sensor
  int LightSensorValue = analogRead(LightSensor); 
  float Rsensor= LightSensorValue * 3.3 / 1023;
  Serial.print("LightSensor: ");
  Serial.print(Rsensor);
  Serial.println();
  Device.Send(Rsensor, LIGHT_SENSOR);
  delay(300000);

  //Magnetic Door Sensor
  bool DoorSensorRead = digitalRead(DoorSensor);
  Serial.print("DoorSensor: ");
  Serial.print(DoorSensorRead);
  Serial.println();
  Device.Send(DoorSensorRead, DOOR_SENSOR);
  delay(300000);

  //Air Quality Sensor
  airQValue = airqualitysensor.getRawData();
  Serial.print("AirQSensor: ");
  Serial.print(airQValue);
    Serial.println();
  Device.Send(airQValue, AIR_QUALITY_SENSOR);
  delay(300000);

  //Sound Sensor
  soundValue = analogRead(SoundSensor);
  Serial.print("SoundSensor: ");
  Serial.print(soundValue);
  Serial.print("dB");
    Serial.println();
  Device.Send(soundValue, LOUDNESS_SENSOR);
  delay(300000);

  
}




void serialEvent1()
{
  Device.Process();                           // for future use of actuators
}


