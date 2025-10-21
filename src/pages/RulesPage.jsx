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

  return (
    <div className="p-6 sm:p-8 bg-gray-50 min-h-screen font-sans">
      {/* Main Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">
        GALMEE WALI GALTEEWALDAAGAADDISA MAATI
      </h1>

      {/* Introduction (Not Collapsible) */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <p className="text-gray-700 mb-2">
          <strong>Baay ina miseensaa waldichi it i n bu’uuref ame:</strong> Miseensota 38<br />
          <strong>Guy aa It i Hundeef ame:</strong> Amaj i 2, 2017 ALI
        </p>
        <p className="text-gray-700 mb-2">
          Waldaan kun jireenya hawaasummaa keessatti rakkoowwan bifa adda addaatiin mudatan keessumaa du’aa fi hariiroo maatii yaada keessa galfachuun, dhimmoonni kun yeroo xiyyeeffannoo barbaadanitti gadda irraa wal dandamachiisuuf ykn wal bira dhaabachuuf akkasumas gammachuu gara garaa kan akka firoota wajjiin yaa’ii godhachuu fi laaqana gaarii waliin qooddachuu, jiruuf jireenya miseensa maatii kanaa fooyyessuu adeemsisuuf tokkummaan barbaachisaa ta’ee waan argameef;
        </p>
        <p className="text-gray-700">
          Tokkummaa keenya bu’uura godhachuudhaan addunyaa kanarra yeroo jiraannutti walgargaaruun, jaalala waliif qabnu hojiin ibsuuf akka ta’utti, waldaan gurmaa’uun barbaachisaa waan ta’eef; miseensota waldichaa yaadaan, qaamaa fi tokkummaa hawaasummaatin walitti dhiyeessuun jaalalli gidduu isaanitti akka jabaatu gochuuf, humna akka waliif ta’amuuf waldaan kun hundeeffameera.
        </p>
      </div>

      {/* Ergama */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("ergama")}
        >
          Ergama
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["ergama"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["ergama"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <ul className="list-disc pl-6 text-gray-700">
            <li>Yeroo gaddaa wal jajjabeessuu fi wal deeggaruu</li>
            <li>Walitti dhufeenya maatii cimsuu</li>
          </ul>
        </div>
      </div>

      {/* Mul’ata */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("mulata")}
        >
          Mul’ata
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["mulata"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["mulata"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <p className="text-gray-700">
            Bara 2020 ALI tti kaappitaala waldichaa miliyoona tokkotti ol guddisuun sadarkaa waldichaa gara dhaabbata liqii fi qusannaatti ceesisuu
          </p>
        </div>
      </div>

      {/* KUTAA TOKKO */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("kutaa-tokko")}
        >
          KUTAA TOKKO
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["kutaa-tokko"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["kutaa-tokko"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 1: Mog a sa Maqa Waldicha</h3>
          <p className="text-gray-700">
            Maqaan waldaa kanaa Waldaa Gaaddisa Maatii (WGM) jedhamee waamama.
          </p>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 2: It i Wa mama Waldicha</h3>
          <p className="text-gray-700">
            Itti waamamni waldichaa gumii waliigalaa (miseensa) waldichaati.
          </p>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 3: Mise nsumma Waldicha</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Namni miseensa firoota maatii kanaa ta’ee fi fedhii waldaa kana wajjiin hojjechuu qabu hundi miseensa waldichaa ta’uuf mirga guutuu qaba</li>
            <li>Buusii ji’aan irraa barbaadamu nama yeroon kaffaluuf fedhii qabu wufi seera kaffaltii eeguun raawwatu</li>
            <li>Kaffaltii (Buusii) ji’aan kaffalamuun alatti rakkoon addaa uumamee baasii dabalataa kaffaluuf yoo gaafatame nama kaffaluuf fedha qabu</li>
            <li>Miseensa haaraa boodaan itti dabalamu yoo ta’e, kaffaltii isarraa barbaachisu hunda kaffaluuf nama fedha qabu ta’ee:-
              <ol className="list-[lower-alpha] pl-6">
                <li>Iyyannoo bifa barreeffamaan dhiyeeffachuu qaba</li>
                <li>Koreen waldichaa yeroo torban lama hin caalle keessatti iyyannoo isaa ilaalee gumii walii galaaf ni dhiyeessa.</li>
                <li>Iyyanni isaa gumii walii galaaf dhiyaatee, yoo gumiin (koreen) irratti walii gale miseensa ta’uu ni danda’a</li>
              </ol>
            </li>
            <li>Waldichi miseensota maatii qofaan kan socho’u waan ta’eef miseensota maatiitiin miseensummaanis kan kennamu namoota miseensa maatii (firoota) ta’an qofadha.</li>
          </ol>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 4: Da nga Ra wwatama It i n Bulma ta Se richa</h3>
          <p className="text-gray-700">
            Seerri ittiin bulmaatichaa kan raawwatu miseensa waldichaa irratti ta’a.
          </p>
        </div>
      </div>

      {/* KUTAA LAMA */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("kutaa-lama")}
        >
          KUTAA LAMA
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["kutaa-lama"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["kutaa-lama"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">MIRGAA FI DIRQAMA MISEENSAA</h3>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 5: Mirga Mise nsa</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Akka seera waldichaatti faayidaalee eeyyamamaniif ni argata.</li>
            <li>Yaadasaa walabummaadhaan ibsachuu danda’a</li>
            <li>Seericharra waan jiru gaafatee argachuu danda’a.</li>
          </ol>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 6: Dirqama Mise nsa</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Buusii miseensummaa ji’a ji’aan kaffalamu yeroo jedhametti kaffaluu</li>
            <li>Seera ittiin bulmaata waldichaatiif ajajamuu fi raawwachuu.</li>
            <li>Maatii miseensaa keessatti yoo gaddi du’aa mudate sirna awwaalchaa geggeessuuf baasiin koreen murtaa’e kappitaala waldichaa irraa akka bahuuf eyyamamaa ta’uu</li>
            <li>Miseensi gaddi isa mudatu yeroon gaddi itti mudate wayita kaappitaalli waldichaa kaffaltii raawwachuu hin dandeenye (maallaqa xiqqaa qarshii 20,000 gadi) ta’utti yoo ta’e yeroo beellamaa koreen mariidhaan murteessu eeggatee faayidaa argachuu qabu akka argatu ta’uu hubachuu</li>
            <li>Yaa’ii maatii irratti argamuu fi laaqana gaarii hirmaachuu (dirqama jaalala maatii)</li>
            <li>Miseensi miseensummaadhaan itti fufuu yoo hin barbaanne, duraan dursee sababa gadi dhiisuuf beeksisuu qaba. Haata’u malee sababa qajeelfama waldaja equun kan geggeeffamu yoo ta’e mirgoota eeraman guutumaan guutuutti argachuu hin danda’u.</li>
            <li>Miseensi haala kamiiniyyuu miseensummaa isaa yeroo dhaabutti karaa nagaatiin kan geggeeffamu yoo ta’e kuufama waldichaa ji’a yeroo iyyanni gadhiisuu dhiyaatu jiru gahee nama tokkoo irraa 50% qajeelfama diiguun yoo ta’e garuu 35% fudhatee kan gadhiisu ta’a.</li>
          </ol>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 7: Kaf alti Ila lchise Dirqamo ta Mise nsar a Eegaman</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Miseensi buusii ji’aa qarshii 200 (dhibba lama) kaffala. Qarshiin kun garuu yeroo mara dhaabbataa ta’uu dhiisuu mala; walii galtee miseensaa irratti hundaa’ee jijjiiramuu danda’a.</li>
            <li>Kaffaltiin kan raawwatamu ji,a ji’aan yoo ta’u ji’oota walitti aanan keessatti guyyaa (25 – 02) tti ta’a.</li>
            <li>Kaffaltiin nagaheedhaan hin deeggaramne kamiyyuu fudhatama hin argatu</li>
            <li>Miseensi haaraan waldichatti yommuu dabalamu, qabeenya waliigalaa dhaabbataa waldichi qabu ilaalamee, guutummaa miseensaaf hiruun qooda miseensa tokkoo hangi isaa erga barameen booda, hanga qarshii sanaa yeroo ji’a sadi hin caalle keessatti kaffalee itti dabalama.</li>
          </ol>
        </div>
      </div>

      {/* KUTAA SADI */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("kutaa-sadi")}
        >
          KUTAA SADI
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["kutaa-sadi"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["kutaa-sadi"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">FAAYIDAA MISEENSI ARGATU</h3>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 8</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>
              <strong>Ba si Gad a</strong>
              <ul className="list-disc pl-6">
                <li>Maatii miseensaa keessaa namni (abbaan, haati, obboleessi, obboleettin, abbaan manaa, haati manaa, mucaan(ilmoon) yoo du’e/duutee
                  <ol className="list-[lower-alpha] pl-6">
                    <li>Kuufama waldichaa irraa qarshiin 3000 baasii ta’uun ni gumaachama</li>
                    <li>Kuufamni waldaan qabu yeroo gaddi mudatu sanatti hanga qarshii qajeelgfamni waldichaa baasiif eeyyamuu gadi yoo ta’e hangi maallaqaa kuni yeroo waldaan kaffaltii geggeessuu danda’utti ragaadhaan deeggaramee raawwatama</li>
                  </ol>
                </li>
              </ul>
            </li>
            <li>
              <strong>Yero ma tumma hirma chu</strong>
              <ul className="list-disc pl-6">
                <li>Yaa’ii maatii irratti argamuun sagantaa laaqanaa waldichaan qophaawu irratti hirmaachuun miira maatummaa qooddachuu</li>
              </ul>
            </li>
          </ol>
        </div>
      </div>

      {/* KUTAA AFUR */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("kutaa-afur")}
        >
          KUTAA AFUR
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["kutaa-afur"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["kutaa-afur"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">ADABBI</h3>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 9: Adab i Bu si Ji’a Yero n Kaf alu Dhi su</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Miseensi waldichaa kaffaltii ji’aa utuu hin kaffalin yoo turse, marsaa kaffaltiitiin baayyatee 50% kaffaltii idilee irratti dabaluun kaffaltii itti fufa</li>
            <li>Miseensi guyyaa kaffaltii booda guyyoota 15 gidduutti kaffaluu yoo barbaade 25% kan adabamu yoo ta’u, guyyoota 15 booda osoo kaffaltiin itti aanu hin gahin gidduutti kaffaltiin raawwatamu hin jiru</li>
            <li>Kaffaltii osoo hin kaffalin yoo ji’a sadii oliif turse, akka waan fedhiisaatin waldichaa keessaa of baasetti ilaalama.</li>
            <li>Deebi’ee itti fufuu yoo barbaade immoo akka miseensa haaraatti galmaa’a</li>
          </ol>
        </div>
      </div>

      {/* KUTAA 5 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("kutaa-5")}
        >
          KUTAA 5
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["kutaa-5"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["kutaa-5"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">CAASAA AFOOSHICHAA</h3>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 10: Walda n Kun Ca sa le Arma n Gadi Qaba ta</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Hoogganaa</li>
            <li>Barreessaa</li>
            <li>Qarshii qabaa (3)</li>
            <li>Hojjetaa herreegaa</li>
          </ol>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 11: Gahe Hoji Kore wwani</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>
              <strong>Gahee Hoji Hogganaa</strong>
              <ol className="list-[lower-alpha] pl-6">
                <li>Walga’ii korichaa dura bu’ee ni waama; ni geggeessa.</li>
                <li>Dambii jiruu fi ba’uratti hundaa’ee qarshii fi qabeenyarratti ni ajaja</li>
                <li>Hojii walii galaa olaantummaadhaan ni to’ata.</li>
                <li>Gabaasa miseensotaaf ni dhiyeessa</li>
              </ol>
            </li>
            <li>
              <strong>Gahee hoji bar eessaa</strong>
              <ol className="list-[lower-alpha] pl-6">
                <li>Qabsiisa walga’ii barreeffamaan qabuudhaan walga’iirratti ni dhiyeessa.</li>
                <li>Galmee koreen dhiyeesserratti maqaa miseensotaa ni galmeessa.</li>
                <li>Hogganaan yoo hin jirre bakka isaa bu’ee ni hojjeta.</li>
                <li>Miseensonni kaffaltii raawwachuu fi bakka waamamanitti argamuufi dhiisuu isaanii ni to’ata; barreeffamaanis ni qabata ni ifoomsa.</li>
                <li>Gabaasa walii galaa ji’a ji’aan ni qopheessa ni ifoomsa.</li>
              </ol>
            </li>
            <li>
              <strong>Gahee hoji Qarshi qabaa</strong>
              <ol className="list-[lower-alpha] pl-6">
                <li>Lakkoofsa herreega baankii waldichaa of harkatti qabuun yeroo hojiif barbaachisetti immoo ajajaa fi mallattoo hogganaatiin baasuu danda’u.</li>
                <li>Lakkoofsa herregaa waldichaa akka ta’utti of eeggannoon ni qabu.</li>
                <li>Kaffaltii ji’a ji’aan kaffalamu miseensonni erga raawwatanii nagahee isaa sassaabuun eeggannoon ni qabatu.</li>
                <li>Akka dambii walichaatti yeroo ajajamu qarshii baasii ni godhu, nagahee baasiis sirnaan ni qabachuun hojjetaa herreegaaf ni beeksisu.</li>
                <li>Yeroo kamittiyyuu hojii ariifachiisaaf yoo waamame argamee itti gaafatama isaa ni ba’a.</li>
              </ol>
            </li>
            <li>
              <strong>Gahee hoji hoj etaa her eegaa</strong>
              <ol className="list-[lower-alpha] pl-6">
                <li>Lakkoofsa Herreeaga Waldichaa (0132080850 10 Ba nki Awa sh) ta’e miseensa hunda ni beeksisa</li>
                <li>Baasii fi galii waldichaa galmeessuudhaan ni to’ata.</li>
                <li>Gabaasa galii fi baasii ji’aa fi waggaa waldichaa qopheessuudhaan ji’aafi waggaatti yeroo tokko ni dhiyeessa.</li>
                <li>Yeroo to’annoo baasii fi galiitti bu’aa argame karaa barreessaatiin miseensotaaf ni dhiyeessa.</li>
                <li>Baasii fi galii waldichaa waggaatti si’a lama ni sakatta’a.</li>
              </ol>
            </li>
          </ol>
        </div>
      </div>

      {/* KUTAA 6 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("kutaa-6")}
        >
          KUTAA 6
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["kutaa-6"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["kutaa-6"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">GUYYAA FI YEROO WALGA’I KOREEWWANI FI GUMI WALI GALAA</h3>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 12: Walgayi Kore wwan waldicha</h3>
          <p className="text-gray-700">
            Walgayiin dhaabbataan koree waldichaa ji’a sadiitti yeroo tokko ni geggeeffama.
          </p>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 13: Walgayi Gumi Wali gala waldicha</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Yaa’iin walii galaa waldichaa waggaatti yeroo tokko yoo ta’u sagantaan laaqanaa taasifamuun ergamni lakk.2 irra jiru hojiirra oola; haala adeemsa hojii afooshichaa irratti ni mari’atama.</li>
            <li>Walgayii ariifacchiisaan hogganaadhaan yoo waamame yookiin miseensota keessaa harki lama sadaffaan (2/3 ffaa’n) yoo gaaffii dhiyeessan ni geggeeffama.</li>
          </ol>
        </div>
      </div>

      {/* KUTAA 7 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("kutaa-7")}
        >
          KUTAA 7
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["kutaa-7"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["kutaa-7"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">BARA HOJI KOREE WALDICHAA</h3>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 14</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Namni koree waldichaa ta’ee filatame tokko waggaa lamaaf ni hojjeta.</li>
            <li>Waggaa lamaan booda koree haaraan gumii walii galaatiin ni filatama.</li>
            <li>Namni tokko marsaa lamaaf walitti fufee filatamuu ni danda’a.</li>
            <li>Koree waldichaa keessaa nama dirqama isaa seeraan hin baane, miseensi harki 2/3 ffaa’n yoo irratti walii galan osoo yeroo hojii isaa hin xumurin aangoo isaa gad lakkisee miseensummaa isaatiin itti fufa.</li>
          </ol>
        </div>
      </div>

      {/* KUTAA 8 */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("kutaa-8")}
        >
          KUTAA 8
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["kutaa-8"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["kutaa-8"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">HOJI RRA OOLMAA SEERA ITTI N BULMAATA KANAA</h3>

          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">Ke y ata 15</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Seerri ittiin bulmaataa kun har’a Gurraandhala 22, 2017 ALI irraa eegalee mirkanaa’ee hojiirra oola.</li>
            <li>Seerri ittiin bulmaataa kun kan fooyya’u miseensonni waldichaa harki 2/3 ffaa’n akka fooyya’uuf yoo murteessan qofa.</li>
            <li>Guyyaa seerri kun hojiirra oolerraa eegalee seerri ittiin bulmaataa ragga’e fudhatama kan qabu ta’a.</li>
          </ol>
          <p className="text-gray-700">
            <strong>Hubachi sa:</strong> Yaadonni seera ittiin bulmaataa kana keessatti kallattii dhiiraa irraa ibsaman hundi dubartii irrattis seera qabeessa ta’u.
          </p>
        </div>
      </div>

      {/* MISEENSOTA WALDICHAA */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2
          className="text-xl font-bold text-gray-800 mb-3 flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded transition duration-300"
          onClick={() => toggleSection("miseensota-waldichaa")}
        >
          MISEENSOTA WALDICHAA
          <svg
            className={`w-5 h-5 ml-auto transform transition-transform duration-300 ${openSections["miseensota-waldichaa"] ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </h2>
        <div
          className={`transition-all duration-500 ease-in-out ${openSections["miseensota-waldichaa"] ? "opacity-100 max-h-full" : "opacity-0 max-h-0 overflow-hidden"}`}
        >
          <p className="text-gray-700">
            Nuti miseensotni waldichaa seera ittiin bulmaataa armaan olitti tumame kana sirriitti hubannee irratti walii galuudhaan ”Walda Ga d isa Mati” hundeessineerra. Kanas akkaataa armaan gadiitti mallattoo keenya anni mirkaneessina.
          </p>
          <h3 className="text-lg font-bold text-gray-800 mt-4 mb-2">T.L Maqaa Guutuu Gahee waldicha keessat i qabu Mal at oo</h3>
          <ol className="list-decimal pl-6 text-gray-700">
            <li>Guutamaa Naggasuu - Dura taa’aa</li>
            <li>Tolasaa Guutaa - Barreessa</li>
            <li>Zarituu Urgaahaa - Qabduu Maallaqaa</li>
            <li>Oftaanaan Dassaalany - Hojjetaa Herreegaa</li>
            <li>Caalchisaa Dhugaasaa - Hojjetaa Herreegaa</li>
            <li>Addunyaa Guutaa - Hojjetaa Herreegaa</li>
            <li>Abdataa Dhugumaa - Miseensa</li>
            <li>Addis Urgaahaa - Miseensa</li>
            <li>Adunyaa Dhugaasaa - Miseensa</li>
            <li>Alamii Urgaahaa - Miseensa</li>
            <li>Birqii Dassaaleny - Miseensa</li>
            <li>Dabalaa Baayisaa - Miseensa</li>
            <li>Darajjee Didhaa - Miseensa</li>
            <li>Eebbisaa Dirribaa - Miseensa</li>
            <li>Fiqaaduu Gonfaa - Miseensa</li>
            <li>Fiqaaduu Hirkoo - Miseensa</li>
            <li>Kennaa Urgaahaa - Miseensa</li>
            <li>Lammeessaa Dassaaleny - Miseensa</li>
            <li>Maammoo Baayisaa - Miseensa</li>
            <li>Masarat Dassaalany - Miseensa</li>
            <li>Misoo Urgaahaa - Miseensa</li>
            <li>Obsuu Hirkoo - Miseensa</li>
            <li>Olaanaa Naggasuu - Miseensa</li>
            <li>Sabboonaa Lammeessaa - Miseensa</li>
            <li>Shuumii Bashaanaa - Miseensa</li>
            <li>Shuumii Dassaaleny - Miseensa</li>
            <li>Taabach Urgaahaa - Miseensa</li>
            <li>Taaddasaa Dhugaasaa - Miseensa</li>
            <li>Taakkalaa Baayisaa - Miseensa</li>
            <li>Tarikiuu Dhugaasaa - Miseensa</li>
            <li>Tasfaayee Koorsaa - Miseensa</li>
            <li>Tashaalee Baayisaa - Miseensa</li>
            <li>Tasfaayee Lammeessaa - Miseensa</li>
            <li>Tolasaa Girmaa - Miseensa</li>
            <li>Tolasaa Ijaaraa - Miseensa</li>
            <li>Xinnee Baayisaa - Miseensa</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default WaldaaPage;