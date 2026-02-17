-- CreateTable
CREATE TABLE "WeatherRequest" (
    "id" TEXT NOT NULL,
    "locationRaw" TEXT NOT NULL,
    "locationName" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lon" DOUBLE PRECISION NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "weatherData" JSONB NOT NULL,
    "aiAdvice" TEXT,
    "extraData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WeatherRequest_pkey" PRIMARY KEY ("id")
);
