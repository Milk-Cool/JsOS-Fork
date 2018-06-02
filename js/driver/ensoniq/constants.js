/**
 *    Copyright 2018 JsOS authors
 *
 *    Licensed under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License.
 *    You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software
 *    distributed under the License is distributed on an "AS IS" BASIS,
 *    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *    See the License for the specific language governing permissions and
 *    limitations under the License.
 */

'use strict';

module.exports = {
  'Mixer_Port':                  0x04, // Set to 0x82 for Interrupt Status
  'Mixer_Data':                  0x05, // Read to get Interrupt Status
  'DSP_Read':                    0x0a,
  'DSP_Write':                   0x0c, // Read this port for Write Status
  'DSP_Read Status':             0x0e, // Read this port to acknowledge 8-bit interrupt
  '16bit_Interrupt_Acknowledge': 0x0f, // Read this port to acknowledge 16-bit interrupt (DSP Version 4.0+ Only)

  'Set_Sample_Rate': 0x41,
  'Play_PCM':        0xa6, // Auto Initialize DMA, FIFO Enabled
  'Stop_PCM':        0xd9, // Auto Initialize DMA
  'Get_DSP_Version': 0xe1,
};
