# Отдельное подтверждение пригодности внешних копий

04.11.2026. Проверялась сборка `a2-reset01`, не данные владельца. **До слияния подтверждено:** фактически скачанные вымышленные файлы открываются и полностью восстанавливаются на независимом пустом профиле.

В каждом движке 12 файлов: 3 режима × 2 темы × 2 палитры. Для каждого файл получен через реальный browser download, открыт паролем и recovery, выбран нативным File input для A2, а затем восстановлен через интерфейс приложения в отдельном браузерном контексте. Полный документ, денежные итоги, кредитные показатели и пять режимов прогноза совпали. По 6 UI-подтверждений паролем и recovery в каждом движке. Сами файлы, секреты и дампы базы в репозиторий не включены.

| Движок / сценарий | SHA-256 фактически скачанного файла |
|---|---|
| chromium / light/neutral/financial | `dd9da4ce4f49bcbe0c1ee4e7e242652fdda9609c0a922868ef8c85ca679ee8fb` |
| chromium / light/neutral/categories | `fb3970517dc113857782e0c1494035e193f2c55ebae58385edf38c25fba0aa86` |
| chromium / light/neutral/all | `e064748aeabf441c6b583d5717af00256bfbb28205e807554fefac2eb601ab67` |
| chromium / light/color/financial | `225245439f72b677894b228f33c8804b295448c5df6471998e5a26dadf07ca7b` |
| chromium / light/color/categories | `6508ae3583d491b4e239158ae1e30eff6e7f212b74ab7d42d7517642dab250a3` |
| chromium / light/color/all | `423e0abc4ff85055d9b6754c9d0f0155ed9407f7725f179529d86e277e658380` |
| chromium / dark/neutral/financial | `3a5d01a70c02abc0940f73f9a39b0c9bc40c82515d6349dd2d15b120c2cbe223` |
| chromium / dark/neutral/categories | `9190b8f5716c691d9ab4bf4baa2143c310f4682dd578ae66cadb35bb7a61a934` |
| chromium / dark/neutral/all | `fa8fcfa6670d6e6433003779a3be724291050ebcf64a84aa121b5b01adcb0402` |
| chromium / dark/color/financial | `0f5e26a5e98b5dde831ae6d8783fd6f1aa975dfa88f97f5286d922c2974e2a61` |
| chromium / dark/color/categories | `81cea4cedef6fa6c1bb326e58d804b2f97383c8bbd2ce77cba71b6c12bc6fcfb` |
| chromium / dark/color/all | `a5e08cb7cdaffdcc368753831f5a8a657916c5a89ccb333de3d67554942acece` |
| webkit / light/neutral/financial | `3914364589ca0190a319b63a9a275c63d20440bfbac57c9d92dc0ba387b6c49a` |
| webkit / light/neutral/categories | `868935087d9055b502cf7f94064c33386b35e2260fb761e8012281191b8d85f0` |
| webkit / light/neutral/all | `9e1d99f4a0b0a42a1aebb7549a2158c51007f674b215cc217c15447f169c02e2` |
| webkit / light/color/financial | `bbf8a6d70d206908a4221fade9308ed1d2c1c00892a2be623c89df1ff3108402` |
| webkit / light/color/categories | `332806553bcb5064ef871aa75eb802b66db136b3a35eb66873855dbd6a0bf5b4` |
| webkit / light/color/all | `fb71b5de506983897586c96801ef6d6335ba01be3ee9b5dd6381fe34fd5f5d8f` |
| webkit / dark/neutral/financial | `89c11c54cd6954952c29b877d2b5c9608f3bb6ebef7e5edafdee02b0ed458eac` |
| webkit / dark/neutral/categories | `edbb664fe228450dfa598de2964b42af0d343891e0f5cb3c2c8db8bde4616507` |
| webkit / dark/neutral/all | `70d3d6e5bc04c654a09cf5becfee250da5e6ba7ac8b6e458ffb26644169a5bce` |
| webkit / dark/color/financial | `c0c0c0434bd55ef60efc06614471f2dabc00945010858c36e5172a5c3f50f830` |
| webkit / dark/color/categories | `b0ab9cb67876c9088d58f398e6657e2ab8dbddf5faa6d04d3e606b9f3579dcfa` |
| webkit / dark/color/all | `8082c8f92b77bf9db9ae5a28954d0e05264d37d870e5c807829e216d3770fd9d` |

Ровно 8 МиБ plaintext отдельно зашифрованы, экспортированы и открыты в Node, Chromium и WebKit; лимиты 8 МиБ plaintext / 12 МиБ входного файла не увеличены. Это проверка контейнера, а не обещание конкретного количества операций.

**Это не подтверждение физического сохранения пользовательского файла в iOS «Файлах».** Его проверяет владелец на устройстве. WebKit/Linux с глобальным `setOffline(true)` отвергает чтение File/Blob; дополнительно проверен настоящий отказ HTTP тестового origin без подмены File, с отметкой метода в JSON. Режим полёта и локальный Files provider iPhone остаются аппаратными тестами.

Доказательства: [Chromium](../../Source/evidence/a2/chromium-reset.json), [WebKit](../../Source/evidence/a2/webkit-reset.json).
