# advertisements/api.py

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Advertisement
from pipeline.models import ParsedResult # Import ParsedResult from the pipeline app

# Helper function to save a single result
def save_parsed_result(result_data, advertisement):
    # This logic is moved from your old API view
    ParsedResult.objects.update_or_create(
        advertisement=advertisement, # Link to the ad
        applicant_id=result_data.get("id"),
        defaults={
            "email": result_data.get("email"),
            "phone": result_data.get("phone"),
            # ... add all other fields from your payload here ...
            "input_name": result_data.get("input_name"),
            "extracted_name": result_data.get("extracted_name"),
            "name_status": result_data.get("name_status"),
            "input_father_name": result_data.get("input_father_name"),
            "extracted_father_name": result_data.get("extracted_father_name"),
            "father_name_status": result_data.get("father_name_status"),

            "input_reg_id": result_data.get("input_reg_id"),
            "extracted_reg_id": result_data.get("extracted_reg_id"),
            "reg_id_status": result_data.get("reg_id_status"),

            "input_year": result_data.get("input_year"),
            "extracted_year": result_data.get("extracted_year"),
            "year_status": result_data.get("year_status"),

            "input_paper_code": result_data.get("input_paper_code"),
            "extracted_paper_code": result_data.get("extracted_paper_code"),
            "paper_code_status": result_data.get("paper_code_status"),

            "input_score": result_data.get("input_score"),
            "extracted_score": result_data.get("extracted_score"),
            "score_status": result_data.get("score_status"),

            "input_scoreof100": result_data.get("input_scoreof100"),
            "extracted_scoreof100": result_data.get("extracted_scoreof100"),
            "scoreof100_status": result_data.get("scoreof100_status"),

            "input_rank": result_data.get("input_rank"),
            "extracted_rank": result_data.get("extracted_rank"),
            "rank_status": result_data.get("rank_status"),
        }
    )

class AdvertisementAPIView(APIView):
    """Handles listing and creating new Advertisements."""
    def get(self, request, *args, **kwargs):
        ads = Advertisement.objects.all().order_by('-created_at')
        return Response([{'id': ad.id, 'name': ad.name} for ad in ads])

    def post(self, request, *args, **kwargs):
        name = request.data.get('name')
        if not name:
            return Response({'error': 'Advertisement name is required.'}, status=status.HTTP_400_BAD_REQUEST)
        ad = Advertisement.objects.create(name=name)
        return Response({'id': ad.id, 'name': ad.name}, status=status.HTTP_201_CREATED)

class BulkSaveResultsAPIView(APIView):
    """
    Receives a LIST of verified results and an advertisement ID,
    and saves them to the permanent ParsedResult table.
    """
    def post(self, request, *args, **kwargs):
        results_list = request.data.get('results', [])
        advertisement_id = request.data.get('advertisement_id')

        if not advertisement_id:
            return Response({'error': 'Advertisement ID is required.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            advertisement = Advertisement.objects.get(id=advertisement_id)
        except Advertisement.DoesNotExist:
            return Response({'error': 'Advertisement not found.'}, status=status.HTTP_404_NOT_FOUND)

        saved_count = 0
        errors = []
        for result_data in results_list:
            try:
                save_parsed_result(result_data, advertisement)
                saved_count += 1
            except Exception as e:
                errors.append(f"ID {result_data.get('id', 'N/A')}: {e}")
        
        if errors:
            return Response({
                'status': f'Partial success. Saved {saved_count} of {len(results_list)} results.',
                'errors': errors
            }, status=status.HTTP_207_MULTI_STATUS)
            
        return Response({'status': f'Successfully saved {saved_count} results.'}, status=status.HTTP_200_OK)