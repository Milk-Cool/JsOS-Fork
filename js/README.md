# /js

## English

Here are OS files
- apps - Apps installed via `install` comamnd
- core - OS core
  - block - Block devices
  - fs - File system
  - keyboard - Keyboard
  - mouse - Mouse
  - net - Network
  - pci - PCI devices
  - ps2 - PS/2 devices
  - stdio - Interface and OS input/output
  - storage - Data storage (temporary, not used right now)
  - tty - Terminal (OS command line)
- driver - Several drivers
  - ata - Drivers for ATA hard drives
  - bga - Drivers for graphics mode (see branch graphic-mode and JsMB)
  - ibm->pcspeaker - Driver for PCSpeaker (beeper)
  - ps2 - Drivers for PS/2 mice and keyboards
  - realtek - Drivers for RealTek network cards
  - virtio - Drivers for QEMU network cards
- module - Implementation of node.js modules for JsOS
- service - Embedded services
  - appman - Application manager (commands `install` and `start`)
  - shell - Terminal interpreter + standard commands

In file `__loader` base modules are included (fs, http, events, buffer, sys, os, console, etc.)
In `index.js` basic loader (ran right after kernel) is placed. Drivers are also included here.


## Russian

В этой папке находятся файлы операционной системы
- apps - Программы, устанавливаемые с помощью команды `install`
- core - Ядро операционной системы
  - block - Работа с блочными устройствами
  - fs - Работа с файловыми системами
  - keyboard - Работа с клавиатурой
  - mouse - Работа с мышью
  - net - Работа с сетью
  - pci - Работа с PCI устройствами
  - ps2 - Работа с PS/2 устройствами
  - stdio - Интерфейс и работа с системой ввода-вывода ОС
  - storage - Временная, пока не используемая, прослойка для хранения данных
  - tty - Работа с терминалом (командная строка ОС)
- driver - Различные драйвера
  - ata - Драйвера для работы с ata жесткими дисками
  - bga - Драйвера для работы с графическим режимом (см. ветку graphic-mode и JsMB)
  - ibm->pcspeaker - Драйвер для PCSpeaker'а (пищалки)
  - ps2 - Драйвера для работы с PS/2 мышками и клавиатурами
  - realtek - Драйвера для работы с сетевыми картами от RealTek
  - virtio - Драйвера для работы с сетевыми картами QEMU
- module - Реализация node.js интерфейсов для JsOS
- service - Встроенные сервисы
  - appman - Менеджер приложений (команды `install` и `start`)
  - shell - Интерпретатор терминала + стандартные команды
  
В файле __loader подключаются базовые модули (fs, http, events, buffer, sys, os, console, etc.)
В index.js находится базовая загрузка (выполняется сразу после запуска ядра)
Так же, там подключаются драйвера.
