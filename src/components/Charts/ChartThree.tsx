import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import type { ApexOptions } from "apexcharts";

interface Province {
  id: number;
  streetAddress: string;
  propertyId: number;
  cityId: number;
  stateId: number;
}

interface ProvinceData {
  province: Province[];
}

interface ProvinceCount {
  [key: string]: number;
}

const provinceNames: { [key: number]: string } = {
  1: "Sindh",
  2: "Punjab",
  3: "Balochistan",
  4: "KPK",
  5: "Gilgit-Baltistan"
};

const provinceColors = ["#228B22", "#32CD32", "#66CDAA", "#ADFF2F", "#90EE90"];

const ChartThree: React.FC = () => {
  const [data, setData] = useState<ProvinceData | null>(null);
  const [provinceCounts, setProvinceCounts] = useState<ProvinceCount>({});
  const [series, setSeries] = useState<number[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const [date, setDate] = useState([{ startDate: "", endDate: "" }]);

  const getDefaultDateRange = (): { startDate: string; endDate: string } => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const startDate = firstDay.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const endDate = now.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    return { startDate, endDate };
  };

  useEffect(() => {
    setDate([getDefaultDateRange()]);
  }, []); // Runs only once when the component mounts

  useEffect(() => {
    console.log(date, "date =================================="); // This will log the updated date state
  }, [date]); // Logs whenever date state updates

  useEffect(() => {
    
    const fetchData = async () => {



      try {
        const response = await fetch(`/api/provinces?month=0&year=2025`);
        if (!response.ok) {
          throw new Error('Error Response');
        }
        const result = await response.json();
        setData(result);
        
        // Process the data to count provinces
        const counts: ProvinceCount = {};
        result.province.forEach((item: Province) => {
          const provinceName = provinceNames[item.stateId] || `Unknown (${item.stateId})`;
          counts[provinceName] = (counts[provinceName] || 0) + 1;
        });
        
        setProvinceCounts(counts);
        
        // Update series and labels
        const provinceEntries = Object.entries(counts);
        setSeries(provinceEntries.map(([_, count]) => count));
        setLabels(provinceEntries.map(([name]) => name));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  const options: ApexOptions = {
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "donut",
    },
    colors: provinceColors,
    labels: labels,
    legend: {
      show: false,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "65%",
          background: "transparent",
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 2600,
        options: {
          chart: {
            width: 380,
          },
        },
      },
      {
        breakpoint: 640,
        options: {
          chart: {
            width: 200,
          },
        },
      },
    ],
  };

  const calculatePercentage = (count: number): string => {
    const total = series.reduce((acc, curr) => acc + curr, 0);
    return ((count / total) * 100).toFixed(1);
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-5">
      <div className="mb-3 justify-between gap-4 sm:flex">
        <div>
          <h5 className="text-xl font-semibold text-black dark:text-white">
            Province Distribution
          </h5>
        </div>
        <div>
          <div className="relative z-20 inline-block">
            <select
              name=""
              id=""
              className="relative z-20 inline-flex appearance-none bg-transparent py-1 pl-3 pr-8 text-sm font-medium outline-none"
            >
              <option value="" className="dark:bg-boxdark">
                Monthly
              </option>
              <option value="" className="dark:bg-boxdark">
                Yearly
              </option>
            </select>
            <span className="absolute right-3 top-1/2 z-10 -translate-y-1/2">
              <svg
                width="10"
                height="6"
                viewBox="0 0 10 6"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.47072 1.08816C0.47072 1.02932 0.500141 0.955772 0.54427 0.911642C0.647241 0.808672 0.809051 0.808672 0.912022 0.896932L4.85431 4.60386C4.92785 4.67741 5.06025 4.67741 5.14851 4.60386L9.09079 0.896932C9.19376 0.793962 9.35557 0.808672 9.45854 0.911642C9.56151 1.01461 9.5468 1.17642 9.44383 1.27939L5.50155 4.98632C5.22206 5.23639 4.78076 5.23639 4.51598 4.98632L0.558981 1.27939C0.50014 1.22055 0.47072 1.16171 0.47072 1.08816Z"
                  fill="#637381"
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <div className="mb-2">
        <div id="chartThree" className="mx-auto flex justify-center">
          <ReactApexChart 
            options={options} 
            series={series} 
            type="donut" 
          />
        </div>
      </div>

      <div className="-mx-8 flex flex-wrap items-center justify-center gap-y-3">
        {labels.map((label, index) => (
          <div key={label} className="w-full px-8 sm:w-1/2">
            <div className="flex w-full items-center">
              <span 
                className="mr-2 block h-3 w-full max-w-3 rounded-full" 
                style={{ backgroundColor: provinceColors[index] }}
              ></span>
              <p className="flex w-full justify-between text-sm font-medium text-black dark:text-white">
                <span>{label}</span>
                <span>{calculatePercentage(series[index])}%</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartThree;