// src/pages/WaldaaPage.jsx
import React, { useState } from "react";

const WaldaaPage = () => {
  const [openSections, setOpenSections] = useState({
    "kutaa-tokko": false,
    "kutaa-lama": false,
    "kutaa-sadi": false,
    "kutaa-afur": false,
    "kutaa-5": false,
    "kutaa-6": false,
    "kutaa-7": false,
    "kutaa-8": false,
    "miseensota-waldichaa": false,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const sectionColors = {
    "ergama": "from-blue-500 to-blue-600",
    "mulata": "from-green-500 to-green-600",
    "kutaa-tokko": "from-purple-500 to-purple-600",
    "kutaa-lama": "from-indigo-500 to-indigo-600",
    "kutaa-sadi": "from-pink-500 to-pink-600",
    "kutaa-afur": "from-orange-500 to-orange-600",
    "kutaa-5": "from-teal-500 to-teal-600",
    "kutaa-6": "from-cyan-500 to-cyan-600",
    "kutaa-7": "from-amber-500 to-amber-600",
    "kutaa-8": "from-lime-500 to-lime-600",
    "miseensota-waldichaa": "from-violet-500 to-violet-600"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Main Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            GALMEE WALI GALTEE WALDAAGA ADDISA MAATI
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        {/* Introduction (Not Collapsible) */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-6">
            <h2 className="text-xl font-semibold text-white">Seera Ittiin Bulmaata</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <p className="text-sm text-blue-600 font-semibold mb-1">Baay'ina Miseensaa</p>
                <p className="text-lg font-bold text-gray-800">Miseensota 38</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                <p className="text-sm text-green-600 font-semibold mb-1">Guyyaa Itti Hundeefame</p>
                <p className="text-lg font-bold text-gray-800">Amajii 2, 2017 ALI</p>
              </div>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                <strong>Waldaan kun jireenya hawaasummaa keessatti rakkoowwan bifa adda addaatiin mudatan keessumaa du'aa fi hariiroo maatii yaada keessa galfachuun,</strong> dhimmoonni kun yeroo xiyyeeffannoo barbaadanitti gadda irraa wal dandamachiisuuf ykn wal bira dhaabachuuf akkasumas gammachuu gara garaa kan akka firoota wajjiin yaa'ii godhachuu fi laaqana gaarii waliin qooddachuu, jiruuf jireenya miseensa maatii kanaa fooyyessuu adeemsisuuf tokkummaan barbaachisaa ta'ee waan argameef;
              </p>
              <p>
                <strong>Tokkummaa keenya bu'uura godhachuudhaan addunyaa kanarra yeroo jiraannutti walgargaaruun,</strong> jaalala waliif qabnu hojiin ibsuuf akka ta'utti, waldaan gurmaa'uun barbaachisaa waan ta'eef; miseensota waldichaa yaadaan, qaamaa fi tokkummaa hawaasummaatin walitti dhiyeessuun jaalalli gidduu isaanitti akka jabaatu gochuuf, humna akka waliif ta'amuuf waldaan kun hundeeffameera.
              </p>
            </div>
          </div>
        </div>

        {/* Ergama */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${sectionColors["ergama"]} p-6`}>
            <h2
              className="text-xl font-semibold text-white flex items-center cursor-pointer hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-all duration-300"
              onClick={() => toggleSection("ergama")}
            >
              <span className="flex-1">Ergama</span>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${openSections["ergama"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </h2>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openSections["ergama"] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6">
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Yeroo gaddaa wal jajjabeessuu fi wal deeggaruu</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>Walitti dhufeenya maatii cimsuu</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Mul'ata */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${sectionColors["mulata"]} p-6`}>
            <h2
              className="text-xl font-semibold text-white flex items-center cursor-pointer hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-all duration-300"
              onClick={() => toggleSection("mulata")}
            >
              <span className="flex-1">Mul'ata</span>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${openSections["mulata"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </h2>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openSections["mulata"] ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-800 font-medium">
                  Bara 2020 ALI tti kaappitaala waldichaa miliyoona tokkotti ol guddisuun sadarkaa waldichaa gara dhaabbata liqii fi qusannaatti ceesisuu
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KUTAA TOKKO */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${sectionColors["kutaa-tokko"]} p-6`}>
            <h2
              className="text-xl font-semibold text-white flex items-center cursor-pointer hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-all duration-300"
              onClick={() => toggleSection("kutaa-tokko")}
            >
              <span className="flex-1">KUTAA TOKKO</span>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${openSections["kutaa-tokko"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </h2>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openSections["kutaa-tokko"] ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6 space-y-6">
              {/* Keyata 1 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Keyata 1: Moggaasa Maqa Waldicha</h3>
                <p className="text-gray-700 bg-purple-50 rounded-lg p-4">
                  Maqaan waldaa kanaa <strong>Waldaa Gaaddisa Maatii (WGM)</strong> jedhamee waamama.
                </p>
              </div>

              {/* Keyata 2 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Keyata 2: Itti Waabama Waldicha</h3>
                <p className="text-gray-700 bg-purple-50 rounded-lg p-4">
                  Itti waamamni waldichaa <strong>gumii waliigalaa (miseensa) waldichaati</strong>.
                </p>
              </div>

              {/* Keyata 3 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Keyata 3: Miseensummaa Waldicha</h3>
                <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                  {[
                    "Namni miseensa firoota maatii kanaa ta'ee fi fedhii waldaa kana wajjiin hojjechuu qabu hundi miseensa waldichaa ta'uuf mirga guutuu qaba",
                    "Buusii ji'aan irraa barbaadamu nama yeroon kaffaluuf fedhii qabu wufi seera kaffaltii eeguun raawwatu",
                    "Kaffaltii (Buusii) ji'aan kaffalamuun alatti rakkoon addaa uumamee baasii dabalataa kaffaluuf yoo gaafatame nama kaffaluuf fedha qabu",
                    `Miseensa haaraa boodaan itti dabalamu yoo ta'e, kaffaltii isarraa barbaachisu hunda kaffaluuf nama fedha qabu ta'ee:`,
                    "Waldichi miseensota maatii qofaan kan socho'u waan ta'eef miseensota maatiitiin miseensummaanis kan kennamu namoota miseensa maatii (firoota) ta'an qofadha."
                  ].map((item, index) => (
                    <li key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      {item}
                      {index === 3 && (
                        <ol className="list-[lower-alpha] pl-6 mt-2 space-y-2">
                          <li>Iyyannoo bifa barreeffamaan dhiyeeffachuu qaba</li>
                          <li>Koreen waldichaa yeroo torban lama hin caalle keessatti iyyannoo isaa ilaalee gumii walii galaaf ni dhiyeessa.</li>
                          <li>Iyyanni isaa gumii walii galaaf dhiyaatee, yoo gumiin (koreen) irratti walii gale miseensa ta'uu ni danda'a</li>
                        </ol>
                      )}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Keyata 4 */}
              <div className="border-l-4 border-purple-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Keyata 4: Dangaa Raawwatama Ittiin Bulmaa Seerichaa</h3>
                <p className="text-gray-700 bg-purple-50 rounded-lg p-4">
                  Seerri ittiin bulmaatichaa kan raawwatu <strong>miseensa waldichaa irratti ta'a</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* KUTAA LAMA */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${sectionColors["kutaa-lama"]} p-6`}>
            <h2
              className="text-xl font-semibold text-white flex items-center cursor-pointer hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-all duration-300"
              onClick={() => toggleSection("kutaa-lama")}
            >
              <span className="flex-1">KUTAA LAMA</span>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${openSections["kutaa-lama"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </h2>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openSections["kutaa-lama"] ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6 space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 bg-indigo-100 py-2 px-4 rounded-lg inline-block">
                  MIRGAA FI DIRQAMA MISEENSAA
                </h3>
              </div>

              {/* Keyata 5 */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Keyata 5: Mirga Miseensa</h3>
                <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                  {[
                    "Akka seera waldichaatti faayidaalee eeyyamamaniif ni argata.",
                    "Yaadasaa walabummaadhaan ibsachuu danda'a",
                    "Seericharra waan jiru gaafatee argachuu danda'a."
                  ].map((item, index) => (
                    <li key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Keyata 6 */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Keyata 6: Dirqama Miseensa</h3>
                <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                  {[
                    "Buusii miseensummaa ji'a ji'aan kaffalamu yeroo jedhametti kaffaluu",
                    "Seera ittiin bulmaata waldichaatiif ajajamuu fi raawwachuu.",
                    "Maatii miseensaa keessatti yoo gaddi du'aa mudate sirna awwaalchaa geggeessuuf baasiin koreen murtaa'e kappitaala waldichaa irraa akka bahuuf eyyamamaa ta'uu",
                    "Miseensi gaddi isa mudatu yeroon gaddi itti mudate wayita kaappitaalli waldichaa kaffaltii raawwachuu hin dandeenye (maallaqa xiqqaa qarshii 20,000 gadi) ta'utti yoo ta'e yeroo beellamaa koreen mariidhaan murteessu eeggatee faayidaa argachuu qabu akka argatu ta'uu hubachuu",
                    "Yaa'ii maatii irratti argamuu fi laaqana gaarii hirmaachuu (dirqama jaalala maatii)",
                    "Miseensi miseensummaadhaan itti fufuu yoo hin barbaanne, duraan dursee sababa gadi dhiisuuf beeksisuu qaba. Haata'u malee sababa qajeelfama waldaja equun kan geggeeffamu yoo ta'e mirgoota eeraman guutumaan guutuutti argachuu hin danda'u.",
                    "Miseensi haala kamiiniyyuu miseensummaa isaa yeroo dhaabutti karaa nagaatiin kan geggeeffamu yoo ta'e kuufama waldichaa ji'a yeroo iyyanni gadhiisuu dhiyaatu jiru gahee nama tokkoo irraa 50% qajeelfama diiguun yoo ta'e garuu 35% fudhatee kan gadhiisu ta'a."
                  ].map((item, index) => (
                    <li key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Keyata 7 */}
              <div className="border-l-4 border-indigo-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Keyata 7: Kaffalti Ilaalchise Dirqamoo Miseensarra Eegaman</h3>
                <ol className="list-decimal pl-6 space-y-3 text-gray-700">
                  {[
                    "Miseensi buusii ji'aa qarshii 200 (dhibba lama) kaffala. Qarshiin kun garuu yeroo mara dhaabbataa ta'uu dhiisuu mala; walii galtee miseensaa irratti hundaa'ee jijjiiramuu danda'a.",
                    "Kaffaltiin kan raawwatamu ji,a ji'aan yoo ta'u ji'oota walitti aanan keessatti guyyaa (25 – 02) tti ta'a.",
                    "Kaffaltiin nagaheedhaan hin deeggaramne kamiyyuu fudhatama hin argatu",
                    "Miseensi haaraan waldichatti yommuu dabalamu, qabeenya waliigalaa dhaabbataa waldichi qabu ilaalamee, guutummaa miseensaaf hiruun qooda miseensa tokkoo hangi isaa erga barameen booda, hanga qarshii sanaa yeroo ji'a sadi hin caalle keessatti kaffalee itti dabalama."
                  ].map((item, index) => (
                    <li key={index} className="bg-white rounded-lg p-3 border border-gray-200">
                      {item}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Continue with similar enhanced structure for remaining sections... */}
        {/* KUTAA SADI */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${sectionColors["kutaa-sadi"]} p-6`}>
            <h2
              className="text-xl font-semibold text-white flex items-center cursor-pointer hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-all duration-300"
              onClick={() => toggleSection("kutaa-sadi")}
            >
              <span className="flex-1">KUTAA SADI</span>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${openSections["kutaa-sadi"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </h2>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openSections["kutaa-sadi"] ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6 space-y-6">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-gray-800 bg-pink-100 py-2 px-4 rounded-lg inline-block">
                  FAAYIDAA MISEENSI ARGATU
                </h3>
              </div>

              <div className="border-l-4 border-pink-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Keyata 8</h3>
                <ol className="list-decimal pl-6 space-y-4 text-gray-700">
                  <li className="bg-white rounded-lg p-4 border border-gray-200">
                    <strong className="text-pink-600">Baasi Gadaa</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>
                        Maatii miseensaa keessaa namni (abbaan, haati, obboleessi, obboleettin, abbaan manaa, haati manaa, mucaan(ilmoon) yoo du'e/duutee
                        <ol className="list-[lower-alpha] pl-6 mt-2 space-y-2">
                          <li>Kuufama waldichaa irraa qarshiin 3000 baasii ta'uun ni gumaachama</li>
                          <li>Kuufamni waldaan qabu yeroo gaddi mudatu sanatti hanga qarshii qajeelgfamni waldichaa baasiif eeyyamuu gadi yoo ta'e hangi maallaqaa kuni yeroo waldaan kaffaltii geggeessuu danda'utti ragaadhaan deeggaramee raawwatama</li>
                        </ol>
                      </li>
                    </ul>
                  </li>
                  <li className="bg-white rounded-lg p-4 border border-gray-200">
                    <strong className="text-pink-600">Yeroom Tummaa Hirmaachuu</strong>
                    <ul className="list-disc pl-6 mt-2 space-y-2">
                      <li>Yaa'ii maatii irratti argamuun sagantaa laaqanaa waldichaan qophaawu irratti hirmaachuun miira maatummaa qooddachuu</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* MISEENSOTA WALDICHAA */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden mb-6">
          <div className={`bg-gradient-to-r ${sectionColors["miseensota-waldichaa"]} p-6`}>
            <h2
              className="text-xl font-semibold text-white flex items-center cursor-pointer hover:bg-white hover:bg-opacity-10 p-2 rounded-lg transition-all duration-300"
              onClick={() => toggleSection("miseensota-waldichaa")}
            >
              <span className="flex-1">MISEENSOTA WALDICHAA</span>
              <svg
                className={`w-6 h-6 transform transition-transform duration-300 ${openSections["miseensota-waldichaa"] ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </h2>
          </div>
          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              openSections["miseensota-waldichaa"] ? "max-h-[3000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="p-6 space-y-6">
              <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
                <p className="text-violet-800 text-center font-medium">
                  Nuti miseensotni waldichaa seera ittiin bulmaataa armaan olitti tumame kana sirriitti hubannee irratti walii galuudhaan "Walda Gaaddisa Maati" hundeessineerra. Kanas akkaataa armaan gadiitti mallattoo keenya anni mirkaneessina.
                </p>
              </div>

              <div className="border-l-4 border-violet-500 pl-4">
                <h3 className="text-lg font-bold text-gray-800 mb-4">T.L Maqaa Guutuu Gahee waldicha keessatti qabu Mallattoo</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {[
                    "Guutamaa Naggasuu - Dura taa'aa",
                    "Tolasaa Guutaa - Barreessa",
                    "Zarituu Urgaahaa - Qabduu Maallaqaa",
                    "Oftaanaan Dassaalany - Hojjetaa Herreegaa",
                    "Caalchisaa Dhugaasaa - Hojjetaa Herreegaa",
                    "Addunyaa Guutaa - Hojjetaa Herreegaa",
                    "Abdataa Dhugumaa - Miseensa",
                    "Addis Urgaahaa - Miseensa",
                    "Adunyaa Dhugaasaa - Miseensa",
                    "Alamii Urgaahaa - Miseensa",
                    "Birqii Dassaaleny - Miseensa",
                    "Dabalaa Baayisaa - Miseensa",
                    "Darajjee Didhaa - Miseensa",
                    "Eebbisaa Dirribaa - Miseensa",
                    "Fiqaaduu Gonfaa - Miseensa",
                    "Fiqaaduu Hirkoo - Miseensa",
                    "Kennaa Urgaahaa - Miseensa",
                    "Lammeessaa Dassaaleny - Miseensa",
                    "Maammoo Baayisaa - Miseensa",
                    "Masarat Dassaalany - Miseensa",
                    "Misoo Urgaahaa - Miseensa",
                    "Obsuu Hirkoo - Miseensa",
                    "Olaanaa Naggasuu - Miseensa",
                    "Sabboonaa Lammeessaa - Miseensa",
                    "Shuumii Bashaanaa - Miseensa",
                    "Shuumii Dassaaleny - Miseensa",
                    "Taabach Urgaahaa - Miseensa",
                    "Taaddasaa Dhugaasaa - Miseensa",
                    "Taakkalaa Baayisaa - Miseensa",
                    "Tarikiuu Dhugaasaa - Miseensa",
                    "Tasfaayee Koorsaa - Miseensa",
                    "Tashaalee Baayisaa - Miseensa",
                    "Tasfaayee Lammeessaa - Miseensa",
                    "Tolasaa Girmaa - Miseensa",
                    "Tolasaa Ijaaraa - Miseensa",
                    "Xinnee Baayisaa - Miseensa"
                  ].map((member, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border border-gray-200 hover:border-violet-300 transition-colors duration-200">
                      <p className="text-gray-700 font-medium">{member}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaldaaPage;